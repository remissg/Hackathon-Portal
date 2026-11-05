/**
 * 404 Route Not Found Handler
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - [${req.method}] ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[Error Handler] ${err.message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
