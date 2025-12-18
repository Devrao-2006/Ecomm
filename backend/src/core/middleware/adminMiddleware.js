import { AppError } from '../errors/AppError.js';

export function adminMiddleware(req, res, next) {
  const roles = (req.user && req.user.roles) || [];
  if (!roles.includes('admin')) {
    return next(new AppError('Admin access required', 403));
  }
  return next();
}