import express from 'express';
<<<<<<< HEAD
import passport from 'passport';
=======
>>>>>>> e8e9bc35347c166c03829b7a59dca062879bb374
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