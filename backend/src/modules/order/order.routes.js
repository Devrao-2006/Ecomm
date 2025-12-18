import express from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware.js';
import { adminMiddleware } from '../../core/middleware/adminMiddleware.js';
import * as orderController from './order.controller.js';

const router = express.Router();

router.get('/me', authMiddleware, orderController.listMyOrders);
router.get('/', authMiddleware, adminMiddleware, orderController.listAllOrders);
router.post('/', authMiddleware, orderController.createOrder);

export default router;