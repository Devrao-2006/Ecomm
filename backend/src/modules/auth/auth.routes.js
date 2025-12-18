import express from 'express';
import { body } from 'express-validator';
import { validate } from '../../core/middleware/validate.js';
import * as authController from './auth.controller.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  authController.login
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Google OAuth endpoints
router.get('/google/url', authController.getGoogleAuthUrl);
router.get('/google/callback', authController.googleCallback);

export default router;