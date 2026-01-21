import mongoose from 'mongoose';
import { Cart } from './cart.model.js';

export async function getCart(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
<<<<<<< HEAD
    const cartDoc = await Cart.findOne({ user: userId }).populate('items.productId');
=======
    const cartDoc = await Cart.findOne({ user: userId });
>>>>>>> e8e9bc35347c166c03829b7a59dca062879bb374
    const cart = cartDoc || { user: userId, items: [] };
    res.json({ success: true, cart: { items: cart.items } });
  } catch (err) {
    next(err);
  }
}

<<<<<<< HEAD
export async function addItem(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { productId, name, price, quantity = 1 } = req.body;

    if (!productId || !name || price === undefined) {
      return res.status(400).json({ success: false, message: 'productId, name, and price are required' });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        name,
        price,
        quantity
      });
    }

    await cart.save();

    // Populate and return
    await cart.populate('items.productId');
    res.json({ success: true, cart: { items: cart.items } });
  } catch (err) {
    next(err);
  }
}

export async function updateItemQuantity(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    await cart.populate('items.productId');
    res.json({ success: true, cart: { items: cart.items } });
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Remove the item using pull
    cart.items.pull({ _id: itemId });
    await cart.save();

    await cart.populate('items.productId');
    res.json({ success: true, cart: { items: cart.items } });
  } catch (err) {
    next(err);
  }
}

=======
>>>>>>> e8e9bc35347c166c03829b7a59dca062879bb374
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