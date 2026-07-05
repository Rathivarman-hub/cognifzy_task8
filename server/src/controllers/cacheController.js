import {
  getRedisClient,
  isRedisAvailable,
  getCacheStats,
  resetCacheStats,
} from '../config/redis.js';

// GET /api/cache/stats
export const getCacheInfo = async (req, res, next) => {
  try {
    const stats = getCacheStats();
    const total = stats.hits + stats.misses;
    const hitRate = total > 0 ? ((stats.hits / total) * 100).toFixed(2) : 0;

    let redisInfo = null;
    if (isRedisAvailable()) {
      const redis = getRedisClient();
      try {
        const info = await redis.info('memory');
        const dbSize = await redis.dbsize();
        const keys = await redis.keys('cache:*');

        const usedMemory = info.match(/used_memory_human:(.+)/)?.[1]?.trim() || 'N/A';
        const maxMemory = info.match(/maxmemory_human:(.+)/)?.[1]?.trim() || 'N/A';

        redisInfo = {
          connected: true,
          totalKeys: dbSize,
          cacheKeys: keys.length,
          usedMemory,
          maxMemory,
        };
      } catch (e) {
        redisInfo = { connected: true, error: e.message };
      }
    } else {
      redisInfo = { connected: false };
    }

    res.json({
      success: true,
      data: {
        hits: stats.hits,
        misses: stats.misses,
        total,
        hitRate: parseFloat(hitRate),
        redis: redisInfo,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cache/clear
export const clearCache = async (req, res, next) => {
  try {
    if (!isRedisAvailable()) {
      return res.json({ success: true, message: 'Redis not available, nothing to clear', cleared: 0 });
    }

    const redis = getRedisClient();
    const keys = await redis.keys('cache:*');
    let cleared = 0;

    if (keys.length > 0) {
      await redis.del(...keys);
      cleared = keys.length;
    }

    resetCacheStats();

    res.json({
      success: true,
      message: `Cache cleared successfully`,
      cleared,
    });
  } catch (error) {
    next(error);
  }
};

export default { getCacheInfo, clearCache };
