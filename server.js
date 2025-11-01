require('dotenv').config();
const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require('dotenv');
const lusca = require('lusca');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/lists');
const itemRoutes = require('./routes/items');

dotenv.config();
const app = express();
app.use(cookieParser());
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

app.get('/', (req, res) => {
  res.send('API Grocery List');
});
const ENV = process.env.NODE_ENV || 'development';
// Start the server only if not running tests
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  sequelize.authenticate()
    .then(() => {
      console.log('Database connected.');
      return sequelize.sync({ alter: true });
    })
    .then(() => {
      console.log('Database synchronized.');
      app.listen(PORT, () => {
        if (ENV === 'production') {
          console.log(`✅ Server running in production mode on port ${PORT}`);
        } else {
          console.log(`🚀 Server running locally at: http://localhost:${PORT}`);
        }
      });
    })
    .catch((err) => console.error('Error on DB:', err));
}
// Export app for tests
module.exports = app;
