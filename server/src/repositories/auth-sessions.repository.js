const { getDb } = require('../config/db');

const createSession = ({ user_id, token_jti, refresh_token_hash, expires_at, ip_address, user_agent }) => {
  const db = getDb();
  db.prepare(`
    INSERT INTO auth_sessions (user_id, token_jti, refresh_token_hash, expires_at, ip_address, user_agent)
    VALUES (@user_id, @token_jti, @refresh_token_hash, @expires_at, @ip_address, @user_agent)
  `).run({ user_id, token_jti, refresh_token_hash, expires_at, ip_address, user_agent });
};

const findActiveSessionByJti = (jti) => {
  const db = getDb();
  return db.prepare(`
    SELECT *
    FROM auth_sessions
    WHERE token_jti = ?
      AND revoked_at IS NULL
      AND datetime(expires_at) > datetime('now')
  `).get(jti);
};

const findRefreshSession = (refresh_token_hash) => {
  const db = getDb();
  return db.prepare(`
    SELECT
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
    WHERE s.refresh_token_hash = ?
      AND s.revoked_at IS NULL
      AND datetime(s.expires_at) > datetime('now')
  `).get(refresh_token_hash);
};

const rotateSession = ({ session_id, token_jti, refresh_token_hash, expires_at, ip_address, user_agent }) => {
  const db = getDb();
  db.prepare(`
    UPDATE auth_sessions
    SET token_jti = @token_jti,
        refresh_token_hash = @refresh_token_hash,
        expires_at = @expires_at,
        ip_address = @ip_address,
        user_agent = @user_agent
    WHERE id = @session_id
  `).run({ session_id, token_jti, refresh_token_hash, expires_at, ip_address, user_agent });
};

const revokeSessionByJti = (jti) => {
  const db = getDb();
  db.prepare(`
    UPDATE auth_sessions
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE token_jti = ? AND revoked_at IS NULL
  `).run(jti);
};

module.exports = {
  createSession,
  findActiveSessionByJti,
  findRefreshSession,
  rotateSession,
  revokeSessionByJti
};