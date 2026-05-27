import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import passport from 'passport';

import { connectMongo } from './config/db.mongo.js';
import { connectPostgres } from './config/db.postgres.js';
import { initRedis, closeRedis } from './config/redis.js';
import { configureGoogleOAuth } from './config/google.js';
import { errorHandler } from './core/errors/errorHandler.js';
import { rateLimiter } from './core/middleware/rateLimiter.js';
import { authMiddleware } from './core/middleware/authMiddleware.js';
import { verifiedMiddleware } from './core/middleware/verifiedMiddleware.js';
import { logger } from './core/utils/logger.js';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import productRoutes from './modules/product/product.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/order/order.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

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

app.use(passport.initialize());
configureGoogleOAuth();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use(rateLimiter);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

app.use('/api/cart', authMiddleware, verifiedMiddleware, cartRoutes);
app.use('/api/orders', authMiddleware, verifiedMiddleware, orderRoutes);
app.use('/api/payments', authMiddleware, verifiedMiddleware, paymentRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

const __dirname = path.resolve();
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  })
);

app.use(errorHandler);

export async function initApp() {
  await connectMongo();
  await connectPostgres();
  await initRedis();
  logger.info('Databases connected');
  return app;
}

export async function shutdownApp() {
  await closeRedis();
  logger.info('Application shutdown complete');
}

export default app;