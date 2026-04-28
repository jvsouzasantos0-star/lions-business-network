const express = require('express');
const authController = require('../controllers/auth.controller');
const { authRequired } = require('../middlewares/auth');
const { loginLimiter, registerLimiter, refreshLimiter } = require('../middlewares/rate-limit');

const router = express.Router();

router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/refresh', refreshLimiter, authController.refresh);
router.post('/logout', authRequired, authController.logout);
router.get('/me', authRequired, authController.me);

module.exports = router;