import Bull from 'bull';

let reportQueue = null;

export const createReportQueue = () => {
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  };

  if (process.env.REDIS_PASSWORD) {
    redisConfig.password = process.env.REDIS_PASSWORD;
  }

  // Upstash requires TLS
  if (redisConfig.host && redisConfig.host.includes('upstash.io')) {
    redisConfig.tls = {};
  }

  reportQueue = new Bull('report-queue', {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 100,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
    },
  });

  reportQueue.on('error', (err) => {
    console.warn('Report Queue error:', err.message);
  });

  reportQueue.on('completed', (job) => {
    console.log(`✅ Report job ${job.id} completed`);
  });

  reportQueue.on('failed', (job, err) => {
    console.error(`❌ Report job ${job.id} failed: ${err.message}`);
  });

  return reportQueue;
};

export const getReportQueue = () => reportQueue;

export const addReportJob = async (data, options = {}) => {
  if (!reportQueue) throw new Error('Report queue not initialized');
  return await reportQueue.add(data, {
    priority: options.priority || 0,
    delay: options.delay || 0,
    ...options,
  });
};

export default { createReportQueue, getReportQueue, addReportJob };
