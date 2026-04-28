const { getDb } = require('../config/db');

const parsePlan = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  price_cents: row.price_cents,
  billing_cycle: row.billing_cycle,
  is_premium: Boolean(row.is_premium),
  benefits: JSON.parse(row.benefits_json || '[]')
});

const listPlans = async () => {
  const db = getDb();
  const rows = await db.query('SELECT * FROM plans ORDER BY price_cents ASC, id ASC');
  return rows.map(parsePlan);
};

const findPlanBySlug = async (slug) => {
  const db = getDb();
  const row = await db.queryOne('SELECT * FROM plans WHERE slug = $1', [slug]);
  return row ? parsePlan(row) : null;
};

const findPlanById = async (id) => {
  const db = getDb();
  const row = await db.queryOne('SELECT * FROM plans WHERE id = $1', [id]);
  return row ? parsePlan(row) : null;
};

module.exports = {
  listPlans,
  findPlanBySlug,
  findPlanById
};
