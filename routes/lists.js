const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const apiLimiter = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { listSchema, itemSchema } = require('../validators/schemas');

const listsController = require('../controllers/listsController');

// Creation of new list
router.post('/', verifyToken, apiLimiter, validate(listSchema), listsController.createList);

// Get all lists
router.get('/', verifyToken, apiLimiter, listsController.getLists);

// Get list by id
router.get('/:id', verifyToken, apiLimiter, listsController.getListById);

// Update list
router.put('/:id', verifyToken, apiLimiter, validate(listSchema), listsController.updateList);

// Delete list
router.delete('/:id', verifyToken, apiLimiter, listsController.deleteList);

// Add item to list
router.post('/:listId/items', verifyToken, apiLimiter, validate(itemSchema), listsController.addItemToList);

// Get all items from list
router.get('/:listId/items', verifyToken, apiLimiter, listsController.getItemsFromList);


module.exports = router;
