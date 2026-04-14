
const listService = require('../services/listService');
const { Item } = require('../models');

exports.createList = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    const list = await listService.createList(name, userId);
    res.status(201).json(list);
  } catch (error) {
    next(error);
  }
};

exports.getLists = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { count, rows } = await listService.getLists(userId, page, limit);
    res.status(200).json({
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getListById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const list = await listService.getListById(id, userId);
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
    const userId = req.user.id;
    const list = await listService.updateList(id, userId, name);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    res.status(200).json(list);
  } catch (error) {
    next(error);
  }
};

exports.deleteList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deleted = await listService.deleteList(id, userId);
    if (!deleted) {
      return res.status(404).json({ message: 'List not found' });
    }
    res.status(200).json({ message: 'List deleted' });
  } catch (error) {
    next(error);
  }
};

const itemService = require('../services/itemService');

exports.addItemToList = async (req, res, next) => {
  try {
    const listId = req.params.listId;
    const { name, quantity } = req.body;
    const userId = req.user.id;
    const newItem = await itemService.addItemToList(listId, userId, name, quantity);
    if (!newItem) {
      return res.status(404).json({ message: 'List not found' });
    }
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

exports.getItemsFromList = async (req, res, next) => {
  try {
    const { listId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await itemService.getItemsFromList(listId, userId, page, limit);
    if (!result) {
      return res.status(404).json({ message: 'List not found' });
    }
    const { count, rows } = result;
    res.status(200).json({
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
