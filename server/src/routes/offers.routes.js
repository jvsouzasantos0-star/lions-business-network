const express = require('express');
const { authRequired } = require('../middlewares/auth');
const offersController = require('../controllers/offers.controller');

const router = express.Router();

router.get('/', authRequired, offersController.list);
router.get('/:id', authRequired, offersController.detail);

module.exports = router;