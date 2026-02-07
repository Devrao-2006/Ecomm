import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient, isRedisAvailable } from '../../config/redis.js';
import { logger } from '../utils/logger.js';

/**
 * Rate limiter middleware with Redis store
 * Falls back to in-memory store if Redis is unavailable
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Max 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,

  // Use Redis store if available
  store: isRedisAvailable()
    ? new RedisStore({
      sendCommand: (...args) => getRedisClient().sendCommand(args),
      prefix: 'rl:', // Rate limit prefix
    })
    : undefined, // Falls back to memory store if Redis unavailable

  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
});