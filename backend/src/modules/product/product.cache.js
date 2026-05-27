import { getRedisClient, isRedisAvailable } from '../../config/redis.js';
import { logger } from '../../core/utils/logger.js';

const PRODUCT_LIST_TTL = 300; // 5 minutes
const PRODUCT_DETAIL_TTL = 600; // 10 minutes

/**
 * Generate cache key for product lists
 * @param {Object} query - Query parameters (page, limit, search, category)
 * @returns {string} Cache key
 */
function getProductListKey(query) {
    const { page = 1, limit = 12, search = '', category = '' } = query;
    return `product:list:p${page}:l${limit}:s${search}:c${category}`;
}

/**
 * Generate cache key for individual product
 * @param {string} productId - Product ID
 * @returns {string} Cache key
 */
function getProductKey(productId) {
    return `product:detail:${productId}`;
}

/**
 * Get product list from cache
 * @param {Object} query - Query parameters
 * @returns {Promise<Object|null>} Cached product list or null
 */
export async function getProductList(query) {
    if (!isRedisAvailable()) {
        return null;
    }

    try {
        const redis = getRedisClient();
        const key = getProductListKey(query);
        const cached = await redis.get(key);

        if (cached) {
            logger.debug(`Product list cache hit for key: ${key}`);
            return JSON.parse(cached);
        }

        logger.debug(`Product list cache miss for key: ${key}`);
        return null;
    } catch (error) {
        logger.error('Error getting product list from cache:', error);
        return null;
    }
}

/**
 * Set product list in cache
 * @param {Object} query - Query parameters
 * @param {Object} data - Product list data to cache
 */
export async function setProductList(query, data) {
    if (!isRedisAvailable()) {
        return;
    }

    try {
        const redis = getRedisClient();
        const key = getProductListKey(query);
        await redis.setEx(key, PRODUCT_LIST_TTL, JSON.stringify(data));
        logger.debug(`Product list cached for key: ${key}`);
    } catch (error) {
        logger.error('Error setting product list in cache:', error);
    }
}

/**
 * Get individual product from cache
 * @param {string} productId - Product ID
 * @returns {Promise<Object|null>} Cached product or null
 */
export async function getProduct(productId) {
    if (!isRedisAvailable()) {
        return null;
    }

    try {
        const redis = getRedisClient();
        const key = getProductKey(productId);
        const cached = await redis.get(key);

        if (cached) {
            logger.debug(`Product cache hit for ID: ${productId}`);
            return JSON.parse(cached);
        }

        logger.debug(`Product cache miss for ID: ${productId}`);
        return null;
    } catch (error) {
        logger.error('Error getting product from cache:', error);
        return null;
    }
}

/**
 * Set individual product in cache
 * @param {string} productId - Product ID
 * @param {Object} data - Product data to cache
 */
export async function setProduct(productId, data) {
    if (!isRedisAvailable()) {
        return;
    }

    try {
        const redis = getRedisClient();
        const key = getProductKey(productId);
        await redis.setEx(key, PRODUCT_DETAIL_TTL, JSON.stringify(data));
        logger.debug(`Product cached for ID: ${productId}`);
    } catch (error) {
        logger.error('Error setting product in cache:', error);
    }
}

/**
 * Invalidate individual product cache
 * @param {string} productId - Product ID
 */
export async function invalidateProduct(productId) {
    if (!isRedisAvailable()) {
        return;
    }

    try {
        const redis = getRedisClient();
        const key = getProductKey(productId);
        await redis.del(key);
        logger.debug(`Product cache invalidated for ID: ${productId}`);
    } catch (error) {
        logger.error('Error invalidating product cache:', error);
    }
}

/**
 * Invalidate all product list caches
 * This is called when products are created, updated, or deleted
 */
export async function invalidateProductLists() {
    if (!isRedisAvailable()) {
        return;
    }

    try {
        const redis = getRedisClient();
        let cursor = 0;
        let deletedCount = 0;
        do {
            const result = await redis.scan(cursor, { MATCH: 'product:list:*', COUNT: 100 });
            cursor = result.cursor;
            if (result.keys.length > 0) {
                await redis.del(result.keys);
                deletedCount += result.keys.length;
            }
        } while (cursor !== 0);

        if (deletedCount > 0) {
            logger.debug(`Invalidated ${deletedCount} product list cache entries`);
        }
    } catch (error) {
        logger.error('Error invalidating product list caches:', error);
    }
}
