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
 * Delete item
 * DELETE /api/items/:id
 */
router.delete('/:id', verifyToken, limiter, async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Access denied: no user info' });
        }
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
        console.error('❌ Error deleting item:', error);
        res.status(500).json({ message: 'Error on item deletion' });
    }
});

module.exports = router;