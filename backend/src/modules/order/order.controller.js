import { prisma } from '../../config/db.prisma.js';
import { AppError } from '../../core/errors/AppError.js';
import { stripe } from '../../config/stripe.js';

export async function createOrder(req, res, next) {
  try {
    const { items, totalAmount, paymentId, paymentRecordId } = req.body;
    if (!items || !items.length) {
      throw new AppError('Order items required', 400);
    }
    if (!paymentId || !paymentRecordId) {
      throw new AppError('paymentId and paymentRecordId are required', 400);
    }
    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }

    const intent = await stripe.paymentIntents.retrieve(paymentId);
    if (intent.status !== 'succeeded') {
      throw new AppError('Payment not completed', 400);
    }
    if (intent.metadata.userId !== req.user.id) {
      throw new AppError('Unauthorized payment', 403);
    }

    const productIds = items.map(i => i.product);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map(p => [p.id, p]));

    let computedTotal = 0;
    const verifiedItems = items.map(item => {
      const product = productMap.get(item.product);
      if (!product) throw new AppError(`Product ${item.product} not found`, 400);
      
      if (product.stock !== undefined && item.quantity > product.stock) {
        throw new AppError(`Insufficient stock for product: ${product.name}`, 400);
      }

      computedTotal += product.price * item.quantity;
      return { productId: item.product, quantity: item.quantity, price: product.price, name: product.name };
    });

    if (Math.abs(computedTotal - totalAmount) > 0.01) {
      throw new AppError('Total amount mismatch', 400);
    }

    const order = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.payments.updateMany({
        where: { id: paymentRecordId, user_id: req.user.id },
        data: { status: 'succeeded' }
      });

      if (updateResult.count === 0) {
        throw new AppError('Payment record not found', 404);
      }

      await tx.transactions.create({
        data: {
          payment_id: paymentRecordId,
          type: 'charge',
          amount: intent.amount / 100,
          status: 'succeeded'
        }
      });

      for (const item of verifiedItems) {
        const updateRes = await tx.product.updateMany({
          where: { 
            id: item.productId, 
            stock: { gte: item.quantity } 
          },
          data: { stock: { decrement: item.quantity } }
        });
        
        if (updateRes.count === 0) {
          throw new AppError(`Failed to deduct stock for product: ${item.name}. May be out of stock.`, 409);
        }
      }

      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount: computedTotal,
          status: 'paid',
          paymentId,
          paymentRecordId,
          items: {
            create: verifiedItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: { items: true }
      });

      return newOrder;
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
}

export async function listAllOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { email: true, name: true } },
        items: { include: { product: true } }
      }
    });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
}