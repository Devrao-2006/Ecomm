import express from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../../core/middleware/authMiddleware.js';
import { idempotency } from '../../core/middleware/idempotencyMiddleware.js';
import { validate } from '../../core/middleware/validate.js';
import * as paymentController from './payment.controller.js';

const router = express.Router();

router.post(
  '/intent',
  authMiddleware,
  idempotency(false),
  [
    body('currency').optional().isString().trim().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
    body('orderId').optional().isUUID().withMessage('Valid order UUID required')
  ],
  validate,
  paymentController.createPaymentIntent
);

export default router;