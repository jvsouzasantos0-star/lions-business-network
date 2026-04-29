const path = require('path');
const dotenv = require('dotenv');

const serverRoot = path.resolve(__dirname, '../..');
const workspaceRoot = path.resolve(__dirname, '../../..');

dotenv.config({ path: path.join(serverRoot, '.env') });

module.exports = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  databaseUrl: process.env.DATABASE_URL || '',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
  publicDir: path.join(workspaceRoot, 'public'),
  // SMTP (nodemailer) – configure via env vars for Gmail App Password
  // SMTP_HOST=smtp.gmail.com
  // SMTP_PORT=587
  // SMTP_USER=seuemail@gmail.com
  // SMTP_PASS=app-password-do-gmail
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || ''
};
