const morgan = require('morgan');
const logger = require('./logger');

// Custom stream for pino
const stream = {
  write: (message) => logger.info(message.trim()),
};

// Choose format based on environment
const format = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';

// Skip /health and log errors as warning/error
const httpLogger = morgan(format, {
  stream,
  // eslint-disable-next-line no-unused-vars
  skip: (req, res) => req.path === '/health',
});

module.exports = httpLogger;
