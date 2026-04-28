const { createError } = require('../utils/errors');

const adminRequired = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(createError(403, 'FORBIDDEN', 'You do not have permission to access this resource.'));
  }
  next();
};

module.exports = { adminRequired };
