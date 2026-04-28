const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const durationToSeconds = (value) => {
  if (typeof value === 'number') {
    return value;
  }

  const match = /^(\d+)([smhd])$/.exec(String(value).trim());
  if (!match) {
    return 900;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const map = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400
  };

  return amount * map[unit];
};

const signAccessToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

const createSessionIdentifiers = () => {
  return {
    jti: crypto.randomUUID(),
    refreshToken: crypto.randomBytes(48).toString('hex')
  };
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  durationToSeconds,
  signAccessToken,
  verifyAccessToken,
  createSessionIdentifiers,
  hashToken
};