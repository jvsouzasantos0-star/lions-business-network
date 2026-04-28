const express = require('express');
const metaController = require('../controllers/meta.controller');

const router = express.Router();

router.get('/manifest', metaController.manifest);

module.exports = router;