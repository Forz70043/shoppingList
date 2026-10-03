const express = require('express');
const { Item, List } = require('../models');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const apiLimiter = require('../middleware/rateLimiter');

/**
 * Delete item
 * DELETE /api/items/:id
 */
router.delete('/:id', verifyToken, apiLimiter, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;    
        
        const item = await Item.findByPk(id, {
            include: {
                model: List,
                as: 'list',
                attributes: ['userId']
            }
        });
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Security check: is the user the owner
        if (item.list.userId !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this item' });
        }

        await item.destroy();
        res.status(200).json({ message: 'Item deleted' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;