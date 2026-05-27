import express from 'express';
import passport from 'passport';
import { body, query } from 'express-validator';
import { validate } from '../../core/middleware/validate.js';
import { authMiddleware } from '../../core/middleware/authMiddleware.js';
import { adminMiddleware } from '../../core/middleware/adminMiddleware.js';
import { resendVerificationRateLimiter, authRateLimiter } from '../../core/middleware/rateLimiter.js';
import * as authController from './auth.controller.js';

const router = express.Router();

router.post(
  '/register',
  authRateLimiter,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  authController.login
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

router.get(
  '/verify-email',
  [
    query('token').isLength({ min: 64, max: 64 }).withMessage('Invalid token format'),
    query('uid').notEmpty().withMessage('User ID is required'),
    query('v').isInt({ min: 0 }).withMessage('Token version is required'),
  ],
  validate,
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  resendVerificationRateLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  validate,
  authController.resendVerificationHandler
);

router.patch(
  '/admin/approve/:userId',
  authMiddleware,
  adminMiddleware,
  authController.adminApproveUserHandler
);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  authController.handleGoogleCallback
);

export default router;