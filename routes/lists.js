const express = require('express');
const RateLimit = require('express-rate-limit');
const { Item, List } = require('../models');
const router = express.Router();
const verifyToken = require('../middleware/auth');

// Rate limiter: max 100 requests per 15 minutes per IP
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

/**
 * Creation of new list
 * POST /api/lists
 */
router.post('/', verifyToken, limiter, async (req, res) => {
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
router.get('/', verifyToken, limiter, async (req, res) => {
    try {
        console.log('Request', { user: req.user, body: req.body, params: req.params });
        if(!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Access denied: no user info' });
        }
        const userId = req.user.id;
        const lists = await List.findAll({ where: { userId } });
        res.status(200).json(lists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error on get lists' });
    }
});

/**
 * Get list by id
 * GET /api/lists/:id
 */
router.get('/:id', verifyToken, limiter, async (req, res) => {
    try {
        if(!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Access denied: no user info' });
        }
        const { id } = req.params;
        const list = await List.findOne({ where: { id, userId: req.user.id } });
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
 * PUT /api/lists/:id
 */
router.put('/:id', verifyToken, limiter, async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'List ID is required' });
        }
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Access denied: no user info' });
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
        console.error(error);
        res.status(500).json({ message: 'Error on update list' });
    }
});

/**
 * Delete list
 * DELETE /api/lists/:id
 */
router.delete('/:id', verifyToken, limiter, async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Access denied: no user info' });
        }
        const userId = req.user.id;
        const list = await List.findOne({ where: { id, userId } });
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
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
 * POST /api/lists/:listId/items
 */
router.post('/:listId/items', verifyToken, limiter, async (req, res) => {
    try {
        const listId = req.params.listId;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Access denied: no user info' });
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
        console.error("Error adding item:", error);
        res.status(500).json({ error: 'Error adding item' });
    }
});

/**
 * Get all items from list
 * GET /api/lists/:listId/items
 */
router.get('/:listId/items', verifyToken, limiter, async (req, res) => {
    try {
        const { listId } = req.params;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Access denied: no user info' });
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
        console.error("Error fetching items:", error);
        res.status(500).json({ error: 'Error fetching items' });
    }
});


module.exports = router;
