import { prisma } from '../../config/db.prisma.js';
import { redisClient } from '../../config/redis.js';
import { logger } from '../../core/utils/logger.js';
import { releasePreAllocatedStockInRedis } from '../product/inventory.service.js';

let workerInterval = null;

/**
 * Scans for pending orders older than expiryMinutes (default 15 mins),
 * cancels them, and restores stock in PostgreSQL and Redis.
 * @param {number} expiryMinutes
 * @returns {Promise<number>} Number of expired orders processed
 */
export async function expireAbandonedOrders(expiryMinutes = 15) {
  const cutoffTime = new Date(Date.now() - expiryMinutes * 60 * 1000);

  try {
    // 1. Find all pending orders created before the cutoff
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'pending',
        createdAt: { lte: cutoffTime }
      },
      include: {
        items: true
      },
      take: 50 // Process in batches to avoid locking huge amounts of rows
    });

    if (expiredOrders.length === 0) {
      return 0;
    }

    logger.info(`Found ${expiredOrders.length} abandoned pending order(s) to expire.`);

    for (const order of expiredOrders) {
      await prisma.$transaction(async (tx) => {
        // Double-check the status hasn't changed concurrently
        const currentOrder = await tx.order.findUnique({
          where: { id: order.id }
        });

        if (!currentOrder || currentOrder.status !== 'pending') {
          return;
        }

        // 1. Mark order as cancelled
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'cancelled' }
        });

        // 2. Restore stock in PostgreSQL
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              version: { increment: 1 }
            }
          });
        }

        // 3. Log audit entry
        await tx.audit_logs.create({
          data: {
            user_id: order.userId,
            action: 'ORDER_EXPIRED_TIMEOUT',
            resource: 'Order',
            resource_id: order.id,
            details: {
              reason: 'Payment timeout (15 minutes elapsed)',
              totalAmount: order.totalAmount,
              itemCount: order.items.length
            }
          }
        });
      });

      // 4. Step 2: Restore stock in Redis
      const itemsToRestore = order.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity
      }));
      await releasePreAllocatedStockInRedis(itemsToRestore);

      logger.info(`Order ${order.id} cancelled due to timeout. Stock restored for ${order.items.length} item(s).`);
    }

    return expiredOrders.length;
  } catch (err) {
    logger.error('Error during expired orders cleanup execution', err);
    return 0;
  }
}

/**
 * Starts the periodic background worker for abandoned order cleanup.
 * @param {number} intervalMs How frequently to run the check (default: every 60 seconds)
 * @param {number} expiryMinutes Time threshold before an order expires (default: 15 minutes)
 */
export function startOrderExpiryWorker(intervalMs = 60000, expiryMinutes = 15) {
  if (workerInterval) {
    logger.warn('Order expiry worker is already running.');
    return;
  }

  logger.info(`Starting abandoned order expiry worker (runs every ${intervalMs / 1000}s, expires after ${expiryMinutes}m)...`);

  // Run initial check immediately
  expireAbandonedOrders(expiryMinutes).catch((err) => {
    logger.error('Initial order expiry check failed', err);
  });

  // Schedule periodic interval
  workerInterval = setInterval(async () => {
    try {
      await expireAbandonedOrders(expiryMinutes);
    } catch (err) {
      logger.error('Scheduled order expiry worker encountered an error', err);
    }
  }, intervalMs);

  // Allow process to exit cleanly if this timer is active
  if (workerInterval.unref) {
    workerInterval.unref();
  }
}

/**
 * Stops the background worker cleanly.
 */
export function stopOrderExpiryWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    logger.info('Order expiry worker stopped.');
  }
}
