const express = require('express');
const authController = require('../controllers/auth.controller');
const passwordResetController = require('../controllers/password-reset.controller');
const { authRequired } = require('../middlewares/auth');
const {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  forgotPasswordLimiter,
  verifyResetCodeLimiter,
  resetPasswordLimiter
} = require('../middlewares/rate-limit');

const router = express.Router();

router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/refresh', refreshLimiter, authController.refresh);
router.post('/logout', authRequired, authController.logout);
router.get('/me', authRequired, authController.me);

router.post('/forgot-password', forgotPasswordLimiter, passwordResetController.forgotPassword);
router.post('/verify-reset-code', verifyResetCodeLimiter, passwordResetController.verifyResetCode);
router.post('/reset-password', resetPasswordLimiter, passwordResetController.resetPassword);

module.exports = router;
