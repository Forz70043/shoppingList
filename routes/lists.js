const express = require('express');
const { Item, List } = require('../models');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const apiLimiter = require('../middleware/rateLimiter');

/**
 * Creation of new list
 * POST /api/lists
 */
router.post('/', verifyToken, apiLimiter, async (req, res, next) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;
        const lista = await List.create({ name, userId });
        res.status(201).json(lista);
    } catch (error) {
        next(error);
    }
});

/**
 * Get all lists
 * GET /api/lists
 */
router.get('/', verifyToken, apiLimiter, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const lists = await List.findAll({ where: { userId } });
        res.status(200).json(lists);
    } catch (error) {
        next(error);
    }
});

/**
 * Get list by id
 * GET /api/lists/:id
 */
router.get('/:id', verifyToken, apiLimiter, async (req, res, next) => {
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
});

/**
 * Update list
 * PUT /api/lists/:id
 */
router.put('/:id', verifyToken, apiLimiter, async (req, res, next) => {
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
});

/**
 * Delete list
 * DELETE /api/lists/:id
 */
router.delete('/:id', verifyToken, apiLimiter, async (req, res, next) => {
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
});

/**
 * Get all items from list
 * POST /api/lists/:listId/items
 */
router.post('/:listId/items', verifyToken, apiLimiter, async (req, res, next) => {
    try {
        const listId = req.params.listId;
        const { name, quantity } = req.body;
    
        // Check if list exists
        const list = await List.findOne({ where: { id: listId, userId: req.user.id } });
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
    
        // Create new item
        const newItem = await Item.create({
            name,
            quantity,
            listId,
        });
    
        res.status(201).json(newItem);
    } 
    catch (error) {
        next(error);
    }
});

/**
 * Get all items from list
 * GET /api/lists/:listId/items
 */
router.get('/:listId/items', verifyToken, apiLimiter, async (req, res, next) => {
    try {
        const { listId } = req.params;
        // Check if list exists
        const list = await List.findOne({ where: { id: listId, userId: req.user.id } });
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        const items = await Item.findAll({
            where: { listId },
        });
    
        res.status(200).json(items);
    } 
    catch (error) {
        next(error);
    }
});


module.exports = router;
