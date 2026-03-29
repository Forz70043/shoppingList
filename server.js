require('dotenv').config();
const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require('dotenv');
const lusca = require('lusca');
const sequelize = require('./config/db');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/lists');
const itemRoutes = require('./routes/items');

dotenv.config();
const app = express();
app.use(cookieParser());
logger.info({ corsOrigin: process.env.CORS_ORIGIN || process.env.FE_URL }, 'CORS origin configured');
app.use(cors({
  credentials: true,
  origin: process.env.CORS_ORIGIN || process.env.FE_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// CSRF protection
app.use(
  lusca({
    // Block XSS and clickjacking
    xframe: 'SAMEORIGIN',
    xssProtection: true,
    // Protect against Content-Type sniffing
    nosniff: true,
    // Set CSP (Content Security Policy)
    csp: {
      policy: {
        'default-src': "'self'",
        'script-src': ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:'],
      },
    },
    // Add HSTS only if you are on HTTPS
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    // Block referrer leakage
    referrerPolicy: 'same-origin',
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/items', itemRoutes);


// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    database: sequelize?.connectionManager?.pool ? 'connected' : 'unknown'
  });
});

app.get('/', (req, res) => {
  res.send('API Grocery List');
});

// Global error handler (must be after routes)
app.use(errorHandler);

const ENV = process.env.NODE_ENV;
const isDev = ENV === 'development';

// Start the server only if not running tests
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  sequelize.authenticate()
  .then(() => {
    logger.info('Database connected');
    return sequelize.sync({ alter: isDev });
  })
  .then(() => {
    logger.info('Database synchronized');
    app.listen(PORT, () => {
      logger.info({ port: PORT, env: ENV }, 'Server started');
    });
  })
  .catch((err) => logger.fatal({ err }, 'Database connection failed'));
}

module.exports = app;
