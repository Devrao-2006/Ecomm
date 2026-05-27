import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient, isRedisAvailable } from '../../config/redis.js';
import { logger } from '../utils/logger.js';

function makeStore(prefix) {
  if (!isRedisAvailable()) return undefined;
  return new RedisStore({
    sendCommand: (...args) => getRedisClient().sendCommand(args),
    prefix,
  });
}

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:global:'),
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
});

export const resendVerificationRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:resend:'),
  handler: (req, res) => {
    logger.warn(`Resend verification rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many resend attempts. Please wait before requesting another verification email.',
    });
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:auth:'),
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
    });
  },
});