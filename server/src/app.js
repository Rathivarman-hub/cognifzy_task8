import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter.js';
import { ExpressAdapter } from '@bull-board/express';

import connectDB from './config/db.js';
import { connectRedis, isRedisAvailable } from './config/redis.js';
import { createEmailQueue, getEmailQueue } from './queues/emailQueue.js';
import { createReportQueue, getReportQueue } from './queues/reportQueue.js';
import startEmailWorker from './workers/emailWorker.js';
import startReportWorker from './workers/reportWorker.js';

import jobRoutes from './routes/jobRoutes.js';
import logRoutes from './routes/logRoutes.js';
import cacheController from './controllers/cacheController.js';

import loggerMiddleware from './middleware/logger.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { cacheMiddleware } from './middleware/cache.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & compression ──────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);
app.use(compression());

const defaultOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'https://serverpulse-1.vercel.app'
];

const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : defaultOrigins;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP request logging (Morgan) ───────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ── Rate limiting ───────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Custom MongoDB logger ───────────────────────────────────────────────────
app.use(loggerMiddleware);

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
  });
});

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/jobs', jobRoutes);
app.use('/api/logs', logRoutes);
app.get('/api/cache/stats', cacheMiddleware(15), cacheController.getCacheInfo);
app.delete('/api/cache/clear', cacheController.clearCache);

// notFound and errorHandler are registered at the END of start(),
// after all dynamic routes (e.g. Bull Board) have been mounted.

// ── Bootstrap ───────────────────────────────────────────────────────────────
const start = async () => {
  // Connect MongoDB
  await connectDB();

  // Connect Redis (optional)
  await connectRedis();

  // Initialize queues — only when Redis is actually reachable
  let bullBoardConfigured = false;
  if (isRedisAvailable()) {
    try {
      createEmailQueue();
      createReportQueue();

      // Bull Board dashboard
      const serverAdapter = new ExpressAdapter();
      serverAdapter.setBasePath('/admin/queues');

      createBullBoard({
        queues: [
          new BullAdapter(getEmailQueue()),
          new BullAdapter(getReportQueue()),
        ],
        serverAdapter,
      });

      app.use('/admin/queues', serverAdapter.getRouter());
      bullBoardConfigured = true;
      console.log('✅ Bull Board available at /admin/queues');

      // Start workers
      startEmailWorker();
      startReportWorker();
    } catch (err) {
      console.warn('⚠️  Bull Queue setup failed:', err.message);
    }
  } else {
    console.warn('⚠️  Redis unavailable – queues, workers, and Bull Board skipped');
  }

  // ── 404 & Error handling (must be LAST, after all dynamic routes) ───────────
  app.use(notFound);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`📡 API:    http://localhost:${PORT}/api`);
    if (bullBoardConfigured) {
      console.log(`🎯 Queues: http://localhost:${PORT}/admin/queues\n`);
    }
  });
};

start().catch(console.error);

export default app;
