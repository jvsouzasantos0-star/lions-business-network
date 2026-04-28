const { getDb } = require('../config/db');

const mapUserWithPlan = (row) => ({
  id: row.id,
  full_name: row.full_name,
  email: row.email,
  role: row.role,
  status: row.status,
  last_login_at: row.last_login_at,
  plan: {
    id: row.plan_id,
    slug: row.plan_slug,
    name: row.plan_name,
    is_premium: Boolean(row.plan_is_premium),
    benefits: JSON.parse(row.plan_benefits_json || '[]'),
    price_cents: row.price_cents,
    billing_cycle: row.billing_cycle
  }
});

const findUserByEmail = async (email) => {
  const db = getDb();
  return db.queryOne('SELECT * FROM users WHERE email = $1', [email]);
};

const createUser = async ({ full_name, email, password_hash, plan_id, role = 'member', status = 'active' }) => {
  const db = getDb();
  const result = await db.run(
    `INSERT INTO users (full_name, email, password_hash, plan_id, role, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [full_name, email, password_hash, plan_id, role, status]
  );
  return result.lastInsertRowid;
};

const updateLastLogin = async (id) => {
  const db = getDb();
  await db.run(
    `UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [id]
  );
};

const findUserProfileById = async (id) => {
  const db = getDb();
  const row = await db.queryOne(
    `SELECT
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.status,
      u.last_login_at,
      p.id AS plan_id,
      p.slug AS plan_slug,
      p.name AS plan_name,
      p.is_premium AS plan_is_premium,
      p.benefits_json AS plan_benefits_json,
      p.price_cents,
      p.billing_cycle
    FROM users u
    JOIN plans p ON p.id = u.plan_id
    WHERE u.id = $1`,
    [id]
  );

  return row ? mapUserWithPlan(row) : null;
};

module.exports = {
  findUserByEmail,
  createUser,
  updateLastLogin,
  findUserProfileById
};
