const RateLimit = require('express-rate-limit');

const apiLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = apiLimiter;
