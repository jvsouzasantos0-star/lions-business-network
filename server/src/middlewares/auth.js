const { verifyAccessToken } = require('../utils/jwt');
const { createError } = require('../utils/errors');
const { findActiveSessionByJti } = require('../repositories/auth-sessions.repository');
const { findUserProfileById } = require('../repositories/users.repository');

const authRequired = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      throw createError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    const session = findActiveSessionByJti(payload.jti);

    if (!session || Number(session.user_id) !== Number(payload.sub)) {
      throw createError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    const user = findUserProfileById(Number(payload.sub));
    if (!user || user.status !== 'active') {
      throw createError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    req.user = {
      ...user,
      jti: payload.jti
    };

    next();
  } catch (error) {
    next(createError(401, 'UNAUTHORIZED', 'Authentication is required.'));
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(createError(403, 'FORBIDDEN', 'You do not have permission to access this resource.'));
  }

  next();
};

module.exports = {
  authRequired,
  requireRole
};