import express from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware.js';
import { adminMiddleware } from '../../core/middleware/adminMiddleware.js';
import * as adminController from './admin.controller.js';

const router = express.Router();

router.get('/stats', authMiddleware, adminMiddleware, adminController.getStats);

export default router;
