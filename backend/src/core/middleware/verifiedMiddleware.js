import { AppError } from '../errors/AppError.js';
import { env } from '../../config/env.js';

export function verifiedMiddleware(req, res, next) {
  const user = req.user;

  if (!user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!user.emailVerified) {
    return next(
      new AppError(
        'Please verify your email address before accessing this resource.',
        403,
        { code: 'EMAIL_NOT_VERIFIED' }
      )
    );
  }

  if (env.requireAdminApproval && !user.adminApproved) {
    return next(
      new AppError(
        'Your account is pending admin approval.',
        403,
        { code: 'PENDING_ADMIN_APPROVAL' }
      )
    );
  }

  return next();
}
