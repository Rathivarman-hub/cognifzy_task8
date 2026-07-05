import Bull from 'bull';

let emailQueue = null;

export const createEmailQueue = () => {
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

  emailQueue = new Bull('email-queue', {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 100,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  });

  emailQueue.on('error', (err) => {
    console.warn('Email Queue error:', err.message);
  });

  emailQueue.on('completed', (job) => {
    console.log(`✅ Email job ${job.id} completed`);
  });

  emailQueue.on('failed', (job, err) => {
    console.error(`❌ Email job ${job.id} failed: ${err.message}`);
  });

  return emailQueue;
};

export const getEmailQueue = () => emailQueue;

export const addEmailJob = async (data, options = {}) => {
  if (!emailQueue) throw new Error('Email queue not initialized');
  return await emailQueue.add(data, {
    priority: options.priority || 0,
    delay: options.delay || 0,
    ...options,
  });
};

export default { createEmailQueue, getEmailQueue, addEmailJob };
