require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/lists');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API Grocery List');
});

sequelize.sync({ force: false, alter: true })
  .then(() => console.log('Database sync'))
  .catch(err => console.error('Error on sync:', err));


app.listen(PORT, () => console.log(`Server start on http://localhost:${PORT}`));
