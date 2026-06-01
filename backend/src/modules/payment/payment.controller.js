import { stripe } from '../../config/stripe.js';
import { AppError } from '../../core/errors/AppError.js';
import { prisma } from '../../config/db.prisma.js';

export async function createPaymentIntent(req, res, next) {
  try {
    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }

    const { currency = 'usd' } = req.body;

    // Fetch user's cart and items
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } }
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Calculate total amount securely
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      if (!item.product) {
        throw new AppError(`Product not found for cart item ${item.name}`, 400);
      }
      if (item.quantity > item.product.stock) {
        throw new AppError(`Insufficient stock for product: ${item.product.name}`, 400);
      }
      totalAmount += item.product.price * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      });
    }

    if (totalAmount <= 0) {
      throw new AppError('Valid cart total required', 400);
    }

    // Create a pending Order
    const newOrder = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        status: 'pending',
        items: {
          create: orderItemsData
        }
      }
    });

    const paymentRecord = await prisma.payments.create({
      data: {
        user_id: req.user.id,
        stripe_payment_intent_id: 'pending', // Temporary placeholder
        amount: totalAmount,
        currency,
        status: 'pending'
      }
    });

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency,
      metadata: {
        userId: req.user.id,
        orderId: newOrder.id,
        paymentRecordId: paymentRecord.id.toString(),
      },
    });

    // Update with real intent IDs
    await prisma.payments.update({
      where: { id: paymentRecord.id },
      data: { stripe_payment_intent_id: intent.id }
    });

    await prisma.order.update({
      where: { id: newOrder.id },
      data: {
        paymentId: intent.id,
        paymentRecordId: paymentRecord.id
      }
    });

    res.json({
      success: true,
      clientSecret: intent.client_secret,
      orderId: newOrder.id,
      paymentIntentId: intent.id,
    });
  } catch (err) {
    next(err);
  }
}
