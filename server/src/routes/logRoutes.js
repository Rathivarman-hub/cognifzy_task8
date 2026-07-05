import { Router } from 'express';
import { getLogs, clearLogs } from '../controllers/logController.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

router.get('/', cacheMiddleware(10), getLogs);
router.delete('/clear', clearLogs);

export default router;
