const express = require('express');
const { authRequired } = require('../middlewares/auth');
const plansController = require('../controllers/plans.controller');

const router = express.Router();

router.get('/', plansController.list);
router.get('/me', authRequired, plansController.me);

module.exports = router;