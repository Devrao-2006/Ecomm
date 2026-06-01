import { prisma } from '../../config/db.prisma.js';
import { AppError } from '../../core/errors/AppError.js';

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