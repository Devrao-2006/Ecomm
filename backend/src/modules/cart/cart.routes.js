import express from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../../core/middleware/authMiddleware.js';
import { validate } from '../../core/middleware/validate.js';
import * as cartController from './cart.controller.js';

const router = express.Router();

// Enforce authMiddleware across all cart operations
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post(
  '/',
  [
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.productId').isUUID().withMessage('Valid product UUID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  validate,
  cartController.setCart
);
router.delete('/', cartController.clearCart);

// Item specific operations
router.post(
  '/items',
  [
    body('productId').isUUID().withMessage('Valid product UUID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  validate,
  cartController.addItem
);

router.put(
  '/:itemId',
  [
    param('itemId').isUUID().withMessage('Valid cart item UUID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  validate,
  cartController.updateItemQuantity
);

router.delete(
  '/:itemId',
  [param('itemId').isUUID().withMessage('Valid cart item UUID is required')],
  validate,
  cartController.removeItem
);

export default router;