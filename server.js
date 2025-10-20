require('dotenv').config();
const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require('dotenv');
const lusca = require('lusca');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/lists');

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
app.use(lusca.csrf());

app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);

app.get('/', (req, res) => {
  res.send('API Grocery List');
});

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
      app.listen(PORT, () => console.log(`Server start on http://localhost:${PORT}`));
    })
    .catch((err) => console.error('Error on DB:', err));
}
// Export app for tests
module.exports = app;
