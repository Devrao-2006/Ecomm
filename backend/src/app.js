import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { connectMongo } from './config/db.mongo.js';
import { connectPostgres } from './config/db.postgres.js';
import { errorHandler } from './core/errors/errorHandler.js';
import { rateLimiter } from './core/middleware/rateLimiter.js';
import { logger } from './core/utils/logger.js';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import productRoutes from './modules/product/product.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/order/order.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';


const app = express();

// Basic security & logging
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use(rateLimiter);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Centralized error handler
app.use(errorHandler);

// Initialize connections (called from server.js)
export async function initApp() {
  await connectMongo();
  await connectPostgres();
  logger.info('Databases connected');
  return app;
}

export default app;