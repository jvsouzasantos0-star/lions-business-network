const express = require('express');
const { authRequired } = require('../middlewares/auth');
const companiesController = require('../controllers/companies.controller');

const router = express.Router();

router.get('/', authRequired, companiesController.list);
router.get('/slug/:slug', authRequired, companiesController.detailBySlug);
router.get('/:id', authRequired, companiesController.detailById);

module.exports = router;