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

const findUserByEmail = (email) => {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
};

const createUser = ({ full_name, email, password_hash, plan_id, role = 'member', status = 'active' }) => {
  const db = getDb();
  const statement = db.prepare(`
    INSERT INTO users (full_name, email, password_hash, plan_id, role, status)
    VALUES (@full_name, @email, @password_hash, @plan_id, @role, @status)
  `);
  const result = statement.run({ full_name, email, password_hash, plan_id, role, status });

  if (result.lastInsertRowid) {
    return result.lastInsertRowid;
  }

  const inserted = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!inserted) {
    throw new Error(`Failed to create user: no row found for email ${email}`);
  }
  return inserted.id;
};

const updateLastLogin = (id) => {
  const db = getDb();
  db.prepare(`
    UPDATE users
    SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(id);
};

const findUserProfileById = (id) => {
  const db = getDb();
  const row = db.prepare(`
    SELECT
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
    WHERE u.id = ?
  `).get(id);

  return row ? mapUserWithPlan(row) : null;
};

module.exports = {
  findUserByEmail,
  createUser,
  updateLastLogin,
  findUserProfileById
};