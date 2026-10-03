const { Item, List } = require('../models');

const addItemToList = async (listId, userId, name, quantity) => {
  const list = await List.findOne({ where: { id: listId, userId } });
  if (!list) return null;
  return await Item.create({ name, quantity, listId });
};

const getItemsFromList = async (listId, userId, page = 1, limit = 10) => {
  const list = await List.findOne({ where: { id: listId, userId } });
  if (!list) return null;
  const offset = (page - 1) * limit;
  const { count, rows } = await Item.findAndCountAll({
    where: { listId },
    offset,
    limit,
    order: [['createdAt', 'DESC']]
  });
  return { count, rows };
};

module.exports = {
  addItemToList,
  getItemsFromList,
};
