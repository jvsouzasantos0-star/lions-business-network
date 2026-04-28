const { getDb } = require('../config/db');

const createSession = async ({ user_id, token_jti, refresh_token_hash, expires_at, ip_address, user_agent }) => {
  const db = getDb();
  await db.run(
    `INSERT INTO auth_sessions (user_id, token_jti, refresh_token_hash, expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [user_id, token_jti, refresh_token_hash, expires_at, ip_address, user_agent]
  );
};

const findActiveSessionByJti = async (jti) => {
  const db = getDb();
  return db.queryOne(
    `SELECT *
     FROM auth_sessions
     WHERE token_jti = $1
       AND revoked_at IS NULL
       AND expires_at > NOW()`,
    [jti]
  );
};

const findRefreshSession = async (refresh_token_hash) => {
  const db = getDb();
  return db.queryOne(
    `SELECT
      s.*,
      u.email,
      u.role,
      u.status,
      u.full_name,
      u.id AS user_id,
      p.id AS plan_id,
      p.slug AS plan_slug,
      p.name AS plan_name,
      p.is_premium AS plan_is_premium,
      p.benefits_json AS plan_benefits_json,
      p.price_cents,
      p.billing_cycle
    FROM auth_sessions s
    JOIN users u ON u.id = s.user_id
    JOIN plans p ON p.id = u.plan_id
    WHERE s.refresh_token_hash = $1
      AND s.revoked_at IS NULL
      AND s.expires_at > NOW()`,
    [refresh_token_hash]
  );
};

const rotateSession = async ({ session_id, token_jti, refresh_token_hash, expires_at, ip_address, user_agent }) => {
  const db = getDb();
  await db.run(
    `UPDATE auth_sessions
     SET token_jti = $1,
         refresh_token_hash = $2,
         expires_at = $3,
         ip_address = $4,
         user_agent = $5
     WHERE id = $6`,
    [token_jti, refresh_token_hash, expires_at, ip_address, user_agent, session_id]
  );
};

const revokeSessionByJti = async (jti) => {
  const db = getDb();
  await db.run(
    `UPDATE auth_sessions SET revoked_at = NOW() WHERE token_jti = $1 AND revoked_at IS NULL`,
    [jti]
  );
};

module.exports = {
  createSession,
  findActiveSessionByJti,
  findRefreshSession,
  rotateSession,
  revokeSessionByJti
};
