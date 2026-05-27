import { createClient } from 'redis';
import { logger } from '../core/utils/logger.js';
import { env } from './env.js';

let redisClient = null;

/**
 * Initialize Redis client connection
 */
export async function initRedis() {
    try {
        const redisUrl = env.redisUrl || 'redis://localhost:6379';

        redisClient = createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        logger.error('Redis max reconnection attempts reached');
                        return new Error('Redis reconnection failed');
                    }
                    const delay = Math.min(retries * 100, 3000);
                    logger.warn(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
                    return delay;
                }
            }
        });

        // Event handlers
        redisClient.on('error', (err) => {
            logger.error('Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            logger.info('Redis client connecting...');
        });

        redisClient.on('ready', () => {
            logger.info('Redis client connected and ready');
        });

        redisClient.on('reconnecting', () => {
            logger.warn('Redis client reconnecting...');
        });

        redisClient.on('end', () => {
            logger.info('Redis client connection closed');
        });

        // Connect to Redis
        await redisClient.connect();

        return redisClient;
    } catch (error) {
        logger.error('Failed to initialize Redis:', error);
        // Don't throw - allow app to run without Redis
        return null;
    }
}

/**
 * Get Redis client instance
 */
export function getRedisClient() {
    return redisClient;
}

/**
 * Gracefully close Redis connection
 */
export async function closeRedis() {
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        logger.info('Redis connection closed gracefully');
    }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable() {
    return redisClient && redisClient.isReady;
}
