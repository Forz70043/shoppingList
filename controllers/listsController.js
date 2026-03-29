const { List, Item } = require('../models');

// Service layer will be added for business logic if needed

exports.createList = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    const list = await List.create({ name, userId });
    res.status(201).json(list);
  } catch (error) {
    next(error);
  }
};

exports.getLists = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const lists = await List.findAll({ where: { userId } });
    res.status(200).json(lists);
  } catch (error) {
    next(error);
  }
};

exports.getListById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const list = await List.findOne({
      where: { id, userId: req.user.id },
      include: [{ model: Item, as: 'items' }],
    });
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    res.status(200).json(list);
  } catch (error) {
    next(error);
  }
};

exports.updateList = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'List ID is required' });
    }
    const { name } = req.body;
    const list = await List.findOne({ where: { id, userId: req.user.id } });
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    list.name = name;
    await list.save();
    res.status(200).json(list);
  } catch (error) {
    next(error);
  }
};

exports.deleteList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const list = await List.findOne({ where: { id, userId } });
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    await list.destroy();
    res.status(200).json({ message: 'List deleted' });
  } catch (error) {
    next(error);
  }
};

exports.addItemToList = async (req, res, next) => {
  try {
    const listId = req.params.listId;
    const { name, quantity } = req.body;
    const list = await List.findOne({ where: { id: listId, userId: req.user.id } });
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    const newItem = await Item.create({ name, quantity, listId });
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

exports.getItemsFromList = async (req, res, next) => {
  try {
    const { listId } = req.params;
    const list = await List.findOne({ where: { id: listId, userId: req.user.id } });
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    const items = await Item.findAll({ where: { listId } });
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};
