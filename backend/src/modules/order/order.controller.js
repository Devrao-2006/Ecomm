import { prisma } from '../../config/db.prisma.js';
import { AppError } from '../../core/errors/AppError.js';
import { logger } from '../../core/utils/logger.js';
import { preAllocateStockInRedis, releasePreAllocatedStockInRedis } from '../product/inventory.service.js';

/**
 * Places an order from the user's cart using the hybrid concurrency strategy.
 */
export async function createOrder(req, res, next) {
  const { shippingAddress, billingAddress } = req.body;
  const idempotencyKey = req.headers['idempotency-key'] || null;

  let allocatedItems = [];

  try {
    // 1. Fetch user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } }
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty', 400);
    }

    // 2. Prepare items and check initial validity
    let totalAmount = 0;
    const itemsToAllocate = [];

    for (const item of cart.items) {
      if (!item.product || item.product.status !== 'ACTIVE') {
        throw new AppError(`Product is no longer available: ${item.name}`, 400);
      }
      if (item.quantity > item.product.stock) {
        throw new AppError(`Insufficient stock for product: ${item.product.name}`, 400);
      }
      totalAmount += item.product.price * item.quantity;
      itemsToAllocate.push({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product
      });
    }

    // 3. Step 1 of Concurrency Strategy: Redis In-Memory Pre-Allocation
    const isPreAllocated = await preAllocateStockInRedis(itemsToAllocate);
    if (!isPreAllocated) {
      throw new AppError('One or more items went out of stock during checkout. Please review your cart.', 422);
    }
    allocatedItems = itemsToAllocate;

    // 4. Step 2 of Concurrency Strategy: PostgreSQL Transaction with Optimistic Locking
    const order = await prisma.$transaction(async (tx) => {
      // Optimistically decrement each product in PostgreSQL
      for (const item of itemsToAllocate) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
            version: item.product.version, // Match version read at start
            stock: { gte: item.quantity }
          },
          data: {
            stock: { decrement: item.quantity },
            version: { increment: 1 } // Advance version
          }
        });

        if (updateResult.count === 0) {
          // Version changed concurrently or stock was exhausted in DB
          throw new AppError(`Transaction race condition on item: ${item.product.name}. Please retry.`, 409);
        }
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount,
          status: 'pending',
          idempotencyKey,
          shippingAddress: shippingAddress || {},
          billingAddress: billingAddress || {},
          items: {
            create: itemsToAllocate.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.product.price
            }))
          }
        },
        include: { items: true }
      });

      // Clear the Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      return newOrder;
    });

    logger.info(`Order placed successfully: ${order.id} for user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (err) {
    // Revert pre-allocated stock in Redis if DB transaction failed
    if (allocatedItems.length > 0) {
      await releasePreAllocatedStockInRedis(allocatedItems);
    }
    next(err);
  }
}

/**
 * List orders for current authenticated user.
 */
export async function listMyOrders(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      }),
      prisma.order.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single order by ID with ownership verification.
 */
export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const isAdmin = req.user.roles?.includes('admin');
    if (order.userId !== req.user.id && !isAdmin) {
      throw new AppError('Forbidden: You do not have access to this order', 403);
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: list all orders across system.
 */
export async function listAllOrders(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { 
          user: { select: { id: true, email: true, name: true } },
          items: { include: { product: true } }
        }
      }),
      prisma.order.count()
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}