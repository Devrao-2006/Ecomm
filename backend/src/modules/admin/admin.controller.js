import { Order } from '../order/order.model.js';
import { User } from '../user/user.model.js';
import { Product } from '../product/product.model.js';

export async function getStats(req, res, next) {
  try {
    const [
      totalOrders,
      revenueResult,
      totalUsers,
      totalProducts
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      User.countDocuments(),
      Product.countDocuments({ isActive: true })
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

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
