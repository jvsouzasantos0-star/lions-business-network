const express = require('express');
const { authRequired } = require('../middlewares/auth');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/', authRequired, dashboardController.getDashboard);

module.exports = router;