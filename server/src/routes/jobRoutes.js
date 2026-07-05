import { Router } from 'express';
import { getAllJobs, queueEmailJob, queueReportJob, getJobById } from '../controllers/jobController.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { strictLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/', cacheMiddleware(30), getAllJobs);
router.get('/:id', getJobById);
router.post('/email', strictLimiter, queueEmailJob);
router.post('/report', strictLimiter, queueReportJob);

export default router;
