import express from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware.js';
import * as userController from './user.controller.js';

const router = express.Router();

router.get('/me', authMiddleware, userController.getMe);

export default router;