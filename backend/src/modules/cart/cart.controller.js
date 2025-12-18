import mongoose from 'mongoose';
import { Cart } from './cart.model.js';

export async function getCart(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const cartDoc = await Cart.findOne({ user: userId });
    const cart = cartDoc || { user: userId, items: [] };
    res.json({ success: true, cart: { items: cart.items } });
  } catch (err) {
    next(err);
  }
}

export async function setCart(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { items } = req.body;
    const cartDoc = await Cart.findOneAndUpdate(
      { user: userId },
      { user: userId, items: items || [] },
      { new: true, upsert: true }
    );
    res.json({ success: true, cart: { items: cartDoc.items } });
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    await Cart.findOneAndUpdate(
      { user: userId },
      { user: userId, items: [] },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}