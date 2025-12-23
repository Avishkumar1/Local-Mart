const express = require('express');
const router = express.Router();
const { search } = require('../controller/searchController');

router.get('/', search);

module.exports = router;
