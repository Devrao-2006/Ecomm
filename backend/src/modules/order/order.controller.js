import { Order } from './order.model.js';
import { Product } from '../product/product.model.js';
import { AppError } from '../../core/errors/AppError.js';
import { stripe } from '../../config/stripe.js';
import { pgPool } from '../../config/db.postgres.js';

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

    // Verify payment with Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentId);
    if (intent.status !== 'succeeded') {
      throw new AppError('Payment not completed', 400);
    }
    if (intent.metadata.userId !== req.user.id) {
      throw new AppError('Unauthorized payment', 403);
    }

    const productIds = items.map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    let computedTotal = 0;
    const verifiedItems = items.map(item => {
      const product = productMap.get(item.product.toString());
      if (!product) throw new AppError(`Product ${item.product} not found`, 400);
      
      // Stock Verification
      if (product.stock !== undefined && item.quantity > product.stock) {
        throw new AppError(`Insufficient stock for product: ${product.name}`, 400);
      }

      computedTotal += product.price * item.quantity;
      return { product: item.product, quantity: item.quantity, price: product.price };
    });

    if (Math.abs(computedTotal - totalAmount) > 0.01) {
      throw new AppError('Total amount mismatch', 400);
    }

    // Update Postgres payment record
    const updateResult = await pgPool.query(
      'UPDATE payments SET status = $1 WHERE id = $2 AND user_id = $3',
      ['succeeded', paymentRecordId, req.user.id]
    );

    if (updateResult.rowCount === 0) {
      throw new AppError('Payment record not found', 404);
    }

    await pgPool.query(
      'INSERT INTO transactions (payment_id, type, amount, status) VALUES ($1, $2, $3, $4)',
      [paymentRecordId, 'charge', intent.amount / 100, 'succeeded']
    );

    // Deduct stock
    const bulkOps = verifiedItems.map(item => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.quantity } }
      }
    }));
    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps);
    }

    const order = await Order.create({
      user: req.user.id,
      items: verifiedItems,
      totalAmount: computedTotal,
      status: 'paid',
      paymentId,
      paymentRecordId,
    });
    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
}

export async function listAllOrders(req, res, next) {
  try {
    const orders = await Order.find().populate('user', 'email name').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
}