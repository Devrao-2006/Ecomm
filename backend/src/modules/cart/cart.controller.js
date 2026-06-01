import { prisma } from '../../config/db.prisma.js';
import { AppError } from '../../core/errors/AppError.js';

export async function getCart(req, res, next) {
  try {
    const userId = req.user.id;
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } }
      });
    }

    res.json({ success: true, cart });
  } catch (err) {
    next(err);
  }
}

export async function addItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true }
      });
    }

    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ success: false, message: `Cannot add more than available stock (${product.stock})` });
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Cannot add more than available stock (${product.stock})` });
      }
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          name: product.name,
          price: product.price,
          quantity
        }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } }
    });

    res.json({ success: true, cart: updatedCart });
  } catch (err) {
    next(err);
  }
}

export async function updateItemQuantity(req, res, next) {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'quantity must be at least 1' });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true, cart: true }
    });

    if (!item || item.cart.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity > item.product.stock) {
      return res.status(400).json({ success: false, message: `Cannot update to more than available stock (${item.product.stock})` });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: item.cart.id },
      include: { items: { include: { product: true } } }
    });

    res.json({ success: true, cart: updatedCart });
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req, res, next) {
  try {
    const { itemId } = req.params;

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!item || item.cart.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: item.cart.id },
      include: { items: { include: { product: true } } }
    });

    res.json({ success: true, cart: updatedCart });
  } catch (err) {
    next(err);
  }
}

export async function setCart(req, res, next) {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
      ...(items && items.length > 0 ? items.map(i => prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: i.productId,
          name: i.name || '',
          price: i.price || 0,
          quantity: i.quantity || 1
        }
      })) : [])
    ]);

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } }
    });

    res.json({ success: true, cart: updatedCart });
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req, res, next) {
  try {
    const userId = req.user.id;
    
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    } else {
      cart = await prisma.cart.create({ data: { userId } });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}