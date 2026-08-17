import { redisClient } from '../../config/redis.js';
import { prisma } from '../../config/db.prisma.js';
import { logger } from '../../core/utils/logger.js';
import { AppError } from '../../core/errors/AppError.js';

// Lua script for atomic stock decrement
const RESERVE_STOCK_LUA = `
local stock_key = KEYS[1]
local qty = tonumber(ARGV[1])

local current_stock = tonumber(redis.call('GET', stock_key))

if current_stock == nil then
  return -1 -- Key does not exist, need DB fallback/sync
end

if current_stock >= qty then
  redis.call('DECRBY', stock_key, qty)
  return 1 -- Success
else
  return 0 -- Insufficient stock
end
`;

/**
 * Initializes/syncs the product stock in Redis from PostgreSQL.
 */
export async function syncProductStockToRedis(productId) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true }
    });

    if (product && redisClient) {
      await redisClient.set(`product:stock:${productId}`, product.stock);
    }
  } catch (err) {
    logger.error(`Failed to sync product stock to Redis for product ${productId}`, err);
  }
}

/**
 * Atomically pre-allocates inventory in Redis.
 * @param {Array<{productId: string, quantity: number}>} items
 * @returns {Promise<boolean>} True if all items successfully pre-allocated
 */
export async function preAllocateStockInRedis(items) {
  if (!redisClient) {
    logger.warn('Redis client not available, skipping Redis pre-allocation filter');
    return true; // Fall back to DB optimistic locking directly
  }

  const allocated = [];

  try {
    for (const item of items) {
      const stockKey = `product:stock:${item.productId}`;
      
      // Execute atomic Lua script
      let result = await redisClient.eval(RESERVE_STOCK_LUA, {
        keys: [stockKey],
        arguments: [item.quantity.toString()]
      });

      // If Redis key missing, sync from DB and retry once
      if (result === -1) {
        await syncProductStockToRedis(item.productId);
        result = await redisClient.eval(RESERVE_STOCK_LUA, {
          keys: [stockKey],
          arguments: [item.quantity.toString()]
        });
      }

      if (result === 1) {
        allocated.push(item);
      } else {
        // Insufficient stock, rollback all already pre-allocated items in this batch
        await releasePreAllocatedStockInRedis(allocated);
        return false;
      }
    }

    return true;
  } catch (err) {
    logger.error('Error during Redis stock pre-allocation', err);
    // On unexpected Redis error, rollback batch and fallback to DB locking
    await releasePreAllocatedStockInRedis(allocated);
    return true;
  }
}

/**
 * Atomically releases/refunds pre-allocated inventory back to Redis.
 * @param {Array<{productId: string, quantity: number}>} items
 */
export async function releasePreAllocatedStockInRedis(items) {
  if (!redisClient || !items || items.length === 0) return;

  try {
    for (const item of items) {
      const stockKey = `product:stock:${item.productId}`;
      await redisClient.incrBy(stockKey, item.quantity);
    }
  } catch (err) {
    logger.error('Failed to release pre-allocated stock in Redis', err);
  }
}
