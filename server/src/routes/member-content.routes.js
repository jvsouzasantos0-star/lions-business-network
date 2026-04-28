const express = require('express');
const { authRequired } = require('../middlewares/auth');
const memberContentController = require('../controllers/member-content.controller');

const router = express.Router();

router.get('/', authRequired, memberContentController.list);
router.get('/:slug', authRequired, memberContentController.detail);

module.exports = router;