const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Category = require('./categoryRoutes');

const router = express.Router();

router.use('/api/v1/categories', Category);

router.get('/', (req, res) => {  
    res.send("Hello World");
});

module.exports = router;