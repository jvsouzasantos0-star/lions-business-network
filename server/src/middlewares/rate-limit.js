const rateLimit = require('express-rate-limit');

const buildLimiter = (windowMs, limit) => rateLimit({
  windowMs,
  limit,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
        details: []
      }
    });
  }
});

module.exports = {
  registerLimiter: buildLimiter(15 * 60 * 1000, 5),
  loginLimiter: buildLimiter(15 * 60 * 1000, 10),
  refreshLimiter: buildLimiter(15 * 60 * 1000, 20),
  publicLimiter: buildLimiter(60 * 1000, 60),
  authReadLimiter: buildLimiter(60 * 1000, 120)
};