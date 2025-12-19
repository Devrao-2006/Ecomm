import { Order } from './order.model.js';
import { AppError } from '../../core/errors/AppError.js';

export async function createOrder(req, res, next) {
  try {
    const { items, totalAmount, paymentId, paymentRecordId } = req.body;
    if (!items || !items.length) {
      throw new AppError('Order items required', 400);
    }
    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
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