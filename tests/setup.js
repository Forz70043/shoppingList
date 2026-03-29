const sequelize = require('../config/db');
const Role = require('../models/Role');
// Load associations
require('../models/index');

async function syncDatabase() {
  await sequelize.sync({ force: true });
  await Role.findOrCreate({ where: { name: 'user' } });
  await Role.findOrCreate({ where: { name: 'admin' } });
}

async function closeDatabase() {
  await sequelize.close();
}

module.exports = { syncDatabase, closeDatabase };
