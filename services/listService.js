const { List } = require('../models');

const createList = async (name, userId) => {
  return await List.create({ name, userId });
};

const getLists = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return await List.findAndCountAll({
    where: { userId },
    offset,
    limit,
    order: [['createdAt', 'DESC']]
  });
};

const getListById = async (id, userId) => {
  return await List.findOne({
    where: { id, userId },
    include: [{ association: 'items' }],
  });
};

const updateList = async (id, userId, name) => {
  const list = await List.findOne({ where: { id, userId } });
  if (!list) return null;
  list.name = name;
  await list.save();
  return list;
};

const deleteList = async (id, userId) => {
  const list = await List.findOne({ where: { id, userId } });
  if (!list) return false;
  await list.destroy();
  return true;
};

module.exports = {
  createList,
  getLists,
  getListById,
  updateList,
  deleteList,
};
