const { Sequelize } = require('sequelize');
require('dotenv').config();

let sslOptions = {};

if (process.env.DB_SSL_CERT) {
  // Normalizza newline e crea un Buffer (accetta PEM come stringa o con \n codificati)
  const rawCert = process.env.DB_SSL_CERT.replace(/\\n/g, '\n');
  sslOptions = {
    ssl: {
      ca: Buffer.from(rawCert),
    },
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    dialectOptions: sslOptions,
    logging: false,
  }
);

module.exports = sequelize;
