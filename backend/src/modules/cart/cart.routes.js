import express from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware.js';
import * as cartController from './cart.controller.js';

const router = express.Router();

router.get('/', authMiddleware, cartController.getCart);
router.post('/', authMiddleware, cartController.setCart);
router.delete('/', authMiddleware, cartController.clearCart);

<<<<<<< HEAD
// Individual item operations
router.post('/items', authMiddleware, cartController.addItem);
router.put('/:itemId', authMiddleware, cartController.updateItemQuantity);
router.delete('/:itemId', authMiddleware, cartController.removeItem);

=======
>>>>>>> e8e9bc35347c166c03829b7a59dca062879bb374
export default router;