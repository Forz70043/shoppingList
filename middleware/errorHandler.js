const logger = require('../config/logger');

// next is required: Express identifies error handlers by their 4-parameter signature
const errorHandler = (err, req, res, _next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  logger.error({
    err,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    userId: req.user?.id,
  });

  res.status(statusCode).json({
    message: statusCode === 500 && isProduction
      ? 'Internal server error'
      : err.message,
    ...(! isProduction && { stack: err.stack }),
  });
};

module.exports = errorHandler;
