import Redis from 'ioredis';

let redisClient = null;
let cacheStats = { hits: 0, misses: 0 };

const createRedisClient = () => {
  const options = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('⚠️  Redis not available, running without cache');
        return null;
      }
      return Math.min(times * 100, 3000);
    },
    lazyConnect: true,
    enableOfflineQueue: false,
  };

  if (process.env.REDIS_PASSWORD) {
    options.password = process.env.REDIS_PASSWORD;
  }

  // Automatically enable TLS for Upstash databases
  if (options.host.includes('upstash.io')) {
    options.tls = {};
  }

  return new Redis(options);
};

export const connectRedis = async () => {
  try {
    redisClient = createRedisClient();

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    redisClient.on('error', (err) => {
      console.warn(`⚠️  Redis Error: ${err.message}`);
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn(`⚠️  Redis not available: ${error.message}`);
    return null;
  }
};

export const getRedisClient = () => redisClient;

export const getCacheStats = () => ({ ...cacheStats });

export const incrementCacheHit = () => cacheStats.hits++;
export const incrementCacheMiss = () => cacheStats.misses++;
export const resetCacheStats = () => { cacheStats = { hits: 0, misses: 0 }; };

export const isRedisAvailable = () => {
  return redisClient && redisClient.status === 'ready';
};

export default { connectRedis, getRedisClient, getCacheStats, isRedisAvailable };
