/**
 * Logger Middleware
 * Logs method, URL, timestamp, and response status for every request.
 */
function loggerMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });

  next();
}

module.exports = loggerMiddleware;
