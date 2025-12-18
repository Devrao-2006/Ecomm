import { AppError } from './AppError.js';
import { logger } from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const error = err instanceof AppError ? err : new AppError(err.message || 'Internal Server Error', err.statusCode || 500);

  if (!error.isOperational) {
    logger.error('Unexpected error', err);
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message,
    details: error.details || null,
  });
}