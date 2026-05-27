import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../errors/AppError.js';
import { User } from '../../modules/user/user.model.js';

export async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies && req.cookies.accessToken;
    if (!token) {
      throw new AppError('Authentication required', 401);
    }
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }
    req.user = {
      id: user._id.toString(),
      roles: user.roles || [],
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified ?? false,
      adminApproved: user.adminApproved ?? true,
    };
    next();
  } catch (err) {
    next(new AppError('Invalid or expired token', 401));
  }
}
