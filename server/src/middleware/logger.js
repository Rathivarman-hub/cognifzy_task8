import Log from '../models/logModel.js';

const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Capture response finish
  res.on('finish', async () => {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    let level = 'info';
    if (statusCode >= 500) level = 'error';
    else if (statusCode >= 400) level = 'warn';

    // Skip Bull Board and health check routes from being logged
    const skipPaths = ['/admin/queues', '/favicon'];
    if (skipPaths.some((p) => req.url.startsWith(p))) return;

    try {
      await Log.create({
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode,
        responseTime,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
        query: Object.keys(req.query).length ? req.query : undefined,
        level,
      });
    } catch (err) {
      // Don't fail the request if logging fails
      console.warn('Logger middleware error:', err.message);
    }
  });

  next();
};

const sanitizeBody = (body) => {
  if (!body) return undefined;
  const sanitized = { ...body };
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
  sensitiveKeys.forEach((key) => {
    if (sanitized[key]) sanitized[key] = '[REDACTED]';
  });
  return sanitized;
};

export default loggerMiddleware;
