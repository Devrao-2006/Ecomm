import express from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware.js';
import * as cartController from './cart.controller.js';

const router = express.Router();

router.get('/', cartController.getCart);
router.post('/', cartController.setCart);
router.delete('/', cartController.clearCart);

// Individual item operations
router.post('/items', cartController.addItem);
router.put('/:itemId', cartController.updateItemQuantity);
router.delete('/:itemId', cartController.removeItem);

export default router;