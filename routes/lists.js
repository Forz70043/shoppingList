const express = require('express');
const { Item, List } = require('../models');
const router = express.Router();
const verifyToken = require('../middleware/auth');

/**
 * Creation of new list
 * POST /api/lists
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;
        const lista = await List.create({ name, userId });
        res.status(201).json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error on creation list' });
    }
});

/**
 * Get all lists
 * GET /api/lists
 */
router.get('/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const lists = await List.findAll({ where: { userId } });
        res.status(200).json(lists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error on get lists' });
    }
});

/**
 * Get list by id
 * GET /api/lists/:userId/:id
 */
router.get('/:userId/:id', verifyToken, async (req, res) => {
    try {
        const { userId, id } = req.params;
        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const list = await List.findOne({ where: { id, userId } });
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        res.status(200).json(list);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error on get list' });
    }
});

/**
 * Update list
 * PUT /api/lists/:userId/:id
 */
router.put('/:userId/:id', verifyToken, async (req, res) => {
    try {
        const { userId, id } = req.params;
        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { name } = req.body;
        const list = await List.findOne({ where: { id, userId } });
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        list.name = name;
        await list.save();
        res.status(200).json(list);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error on update list' });
    }
});

/**
 * Delete list
 * DELETE /api/lists/:userId/:id
 */
router.delete('/:userId/:id', verifyToken, async (req, res) => {
    try {
        const { userId, id } = req.params;
        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const list = await List.findOne({ where: { id, userId } });
        if (!list) {
            return res.status(404).json({ message: 'Lis not found' });
        }
        await list.destroy();
        res.status(200).json({ message: 'List deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error on list deletion' });
    }
});

/**
 * Get all items from list
 * POST /api/lists/:userId/:listId/items
 */
router.post('/:userId/:listId/items', verifyToken, async (req, res) => {
    try {
        const { userId, listId } = req.params;
        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
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
        //console.error("Error adding item:", error);
        res.status(500).json({ error: 'Error adding item' });
    }
});

/**
 * Get all items from list
 * GET /api/lists/:listId/items
 */
router.get('/:userId/:listId/items', verifyToken, async (req, res) => {
    try {
        const { userId, listId } = req.params;
        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
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
        //console.error("Error fetching items:", error);
        res.status(500).json({ error: 'Error fetching items' });
    }
});


module.exports = router;
