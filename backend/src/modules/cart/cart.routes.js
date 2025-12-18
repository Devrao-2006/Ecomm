import express from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware.js';
import * as cartController from './cart.controller.js';

const router = express.Router();

router.get('/', authMiddleware, cartController.getCart);
router.post('/', authMiddleware, cartController.setCart);
router.delete('/', authMiddleware, cartController.clearCart);

export default router;