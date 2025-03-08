const express = require('express');
const List = require('../models/List');
const router = express.Router();

/**
 * Creation of new list
 * POST /api/lists
 */
router.post('/', async (req, res) => {
    try {
        const { name, userId } = req.body;
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
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
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
router.get('/:userId/:id', async (req, res) => {
    try {
        const { userId, id } = req.params;
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
router.put('/:userId/:id', async (req, res) => {
    try {
        const { userId, id } = req.params;
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
router.delete('/:userId/:id', async (req, res) => {
    try {
        const { userId, id } = req.params;
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

module.exports = router;
