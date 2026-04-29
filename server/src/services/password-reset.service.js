const { getDb } = require('../config/db');
const { findUserByEmail } = require('../repositories/users.repository');
const { hashPassword, comparePassword } = require('../utils/password');
const { sendResetCode } = require('./email.service');
const { createError } = require('../utils/errors');

const CODE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

const generateCode = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

const requestReset = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  // Always return success to avoid user enumeration
  if (!user) {
    return { message: 'Se este email estiver cadastrado, você receberá o código em breve.' };
  }

  const db = getDb();
  const code = generateCode();
  const codeHash = await hashPassword(code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  // Invalidate previous codes for this user
  await db.exec(`UPDATE password_resets SET used = true WHERE user_id = $1 AND used = false`, [user.id]);

  await db.run(
    `INSERT INTO password_resets (user_id, code_hash, expires_at) VALUES ($1, $2, $3)`,
    [user.id, codeHash, expiresAt]
  );

  await sendResetCode(normalizedEmail, code);

  return { message: 'Se este email estiver cadastrado, você receberá o código em breve.' };
};

const verifyCode = async (email, code) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw createError(400, 'INVALID_CODE', 'Código inválido ou expirado.');
  }

  const db = getDb();
  const record = await db.queryOne(
    `SELECT * FROM password_resets
     WHERE user_id = $1 AND used = false AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [user.id]
  );

  if (!record) {
    throw createError(400, 'INVALID_CODE', 'Código inválido ou expirado.');
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw createError(429, 'TOO_MANY_ATTEMPTS', 'Muitas tentativas. Solicite um novo código.');
  }

  await db.exec(`UPDATE password_resets SET attempts = attempts + 1 WHERE id = $1`, [record.id]);

  const isValid = await comparePassword(code, record.code_hash);
  if (!isValid) {
    throw createError(400, 'INVALID_CODE', 'Código inválido ou expirado.');
  }

  return { valid: true };
};

const resetPassword = async (email, code, newPassword) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw createError(400, 'INVALID_CODE', 'Código inválido ou expirado.');
  }

  const db = getDb();
  const record = await db.queryOne(
    `SELECT * FROM password_resets
     WHERE user_id = $1 AND used = false AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [user.id]
  );

  if (!record) {
    throw createError(400, 'INVALID_CODE', 'Código inválido ou expirado.');
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw createError(429, 'TOO_MANY_ATTEMPTS', 'Muitas tentativas. Solicite um novo código.');
  }

  await db.exec(`UPDATE password_resets SET attempts = attempts + 1 WHERE id = $1`, [record.id]);

  const isValid = await comparePassword(code, record.code_hash);
  if (!isValid) {
    throw createError(400, 'INVALID_CODE', 'Código inválido ou expirado.');
  }

  const newHash = await hashPassword(newPassword);
  await db.exec(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [newHash, user.id]);
  await db.exec(`UPDATE password_resets SET used = true WHERE id = $1`, [record.id]);

  return { message: 'Senha alterada com sucesso.' };
};

module.exports = { requestReset, verifyCode, resetPassword };
