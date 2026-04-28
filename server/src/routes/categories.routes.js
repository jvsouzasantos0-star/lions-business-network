const express = require('express');
const { authRequired } = require('../middlewares/auth');
const categoriesController = require('../controllers/categories.controller');

const router = express.Router();

router.get('/', authRequired, categoriesController.list);

module.exports = router;