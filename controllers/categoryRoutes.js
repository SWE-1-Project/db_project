const express = require('express');
const Category = require('./categoryController');

const router = express.Router();

router.get('/', Category.findAll);
router.post('/', Category.create);
router.get('/:id', Category.findById);
router.put('/:id', Category.update);
router.delete('/:id', Category.delete);

module.exports = router;