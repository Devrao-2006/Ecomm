import express from 'express';
import { body, query, param } from 'express-validator';
import { authMiddleware } from '../../core/middleware/authMiddleware.js';
import { adminMiddleware } from '../../core/middleware/adminMiddleware.js';
import { idempotency } from '../../core/middleware/idempotencyMiddleware.js';
import { validate } from '../../core/middleware/validate.js';
import * as orderController from './order.controller.js';

const router = express.Router();

// User routes
router.post(
  '/',
  authMiddleware,
  idempotency(false),
  [
    body('shippingAddress').optional().isObject().withMessage('shippingAddress must be an object'),
    body('billingAddress').optional().isObject().withMessage('billingAddress must be an object')
  ],
  validate,
  orderController.createOrder
);

router.get(
  '/me',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  validate,
  orderController.listMyOrders
);

router.get(
  '/:id',
  authMiddleware,
  [param('id').isUUID().withMessage('Valid order UUID required')],
  validate,
  orderController.getOrderById
);

// Admin routes
router.get(
  '/',
  authMiddleware,
  adminMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  validate,
  orderController.listAllOrders
);

export default router;