import {
  getRedisClient,
  isRedisAvailable,
  incrementCacheHit,
  incrementCacheMiss,
} from '../config/redis.js';

const DEFAULT_TTL = 300; // 5 minutes

export const cacheMiddleware = (ttl = DEFAULT_TTL) => {
  return async (req, res, next) => {
    if (!isRedisAvailable()) return next();
    if (req.method !== 'GET') return next();

    const cacheKey = `cache:${req.originalUrl}`;
    const redis = getRedisClient();

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        incrementCacheHit();
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }
      incrementCacheMiss();
      res.setHeader('X-Cache', 'MISS');

      // Intercept the response to cache it
      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        if (res.statusCode === 200) {
          try {
            await redis.setex(cacheKey, ttl, JSON.stringify(data));
          } catch (e) {
            console.warn('Cache set error:', e.message);
          }
        }
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.warn('Cache middleware error:', err.message);
      next();
    }
  };
};

export const invalidateCache = async (patterns) => {
  if (!isRedisAvailable()) return;
  const redis = getRedisClient();

  try {
    for (const pattern of patterns) {
      const keys = await redis.keys(`cache:${pattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } catch (err) {
    console.warn('Cache invalidation error:', err.message);
  }
};

export default cacheMiddleware;
