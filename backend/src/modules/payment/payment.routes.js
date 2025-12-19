import express from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware.js';
import * as paymentController from './payment.controller.js';

const router = express.Router();

router.post('/intent', authMiddleware, paymentController.createPaymentIntent);
router.post('/confirm', authMiddleware, paymentController.confirmPayment);

export default router;