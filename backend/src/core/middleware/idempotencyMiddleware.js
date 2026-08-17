import { redisClient } from '../../config/redis.js';
import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware enforcing Idempotency-Key on critical state mutations.
 * @param {boolean} required Whether the header is mandatory
 * @param {number} ttlSeconds Expiration for stored idempotency keys (default: 86400 / 24h)
 */
export function idempotency(required = true, ttlSeconds = 86400) {
  return async (req, res, next) => {
    const key = req.headers['idempotency-key'];

    if (!key) {
      if (required) {
        return next(new AppError('Idempotency-Key header is required for this operation', 400));
      }
      return next();
    }

    if (!redisClient) {
      return next(); // Fallback if Redis is unavailable
    }

    const redisKey = `idempotency:${key}`;

    try {
      // Check existing entry
      const existing = await redisClient.get(redisKey);

      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.status === 'PROCESSING') {
          return res.status(409).json({
            success: false,
            message: 'A request with this Idempotency-Key is currently being processed. Please retry shortly.'
          });
        }

        // Return cached response
        return res.status(parsed.statusCode).json(parsed.body);
      }

      // Reserve the idempotency key in PROCESSING state (lock)
      await redisClient.set(redisKey, JSON.stringify({ status: 'PROCESSING' }), {
        EX: 120 // 2 minutes lock during processing
      });

      // Capture original json response method to cache the outcome
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Asynchronously save final response to Redis with 24h TTL
        redisClient.set(
          redisKey,
          JSON.stringify({
            status: 'COMPLETED',
            statusCode: res.statusCode || 200,
            body
          }),
          { EX: ttlSeconds }
        ).catch((err) => logger.error('Failed to cache idempotent response in Redis', err));

        return originalJson(body);
      };

      next();
    } catch (err) {
      logger.error('Idempotency middleware error', err);
      next(err);
    }
  };
}
