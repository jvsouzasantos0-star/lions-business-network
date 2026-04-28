const path = require('path');
const dotenv = require('dotenv');

const serverRoot = path.resolve(__dirname, '../..');
const workspaceRoot = path.resolve(__dirname, '../../..');

dotenv.config({ path: path.join(serverRoot, '.env') });

const resolveFromWorkspace = (value) => {
  if (!value) {
    return value;
  }

  return path.isAbsolute(value) ? value : path.resolve(workspaceRoot, value);
};

module.exports = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  sqlitePath: resolveFromWorkspace(process.env.SQLITE_PATH || './data/lions-business-network.sqlite'),
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
  publicDir: path.join(workspaceRoot, 'public')
};