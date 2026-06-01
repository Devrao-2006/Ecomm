import { prisma } from '../../config/db.prisma.js';

export async function getStats(req, res, next) {
  try {
    const [
      totalOrders,
      revenueAgg,
      totalUsers,
      totalProducts
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true }
      }),
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } })
    ]);

    const totalRevenue = revenueAgg._sum.totalAmount || 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        totalUsers,
        totalProducts
      }
    });
  } catch (err) {
    next(err);
  }
}
