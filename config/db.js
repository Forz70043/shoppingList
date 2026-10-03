const { Sequelize } = require('sequelize');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

let sequelize;

if (isTest) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
} else {
  let sslOptions = {};

  if (process.env.DB_SSL_CERT) {
    const rawCert = process.env.DB_SSL_CERT.replace(/\\n/g, '\n');
    sslOptions = {
      ssl: {
        ca: Buffer.from(rawCert),
      },
    };
  }

  sequelize = new Sequelize(
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
}

module.exports = sequelize;
