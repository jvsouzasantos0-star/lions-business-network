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

const listPlans = () => {
  const db = getDb();
  return db.prepare('SELECT * FROM plans ORDER BY price_cents ASC, id ASC').all().map(parsePlan);
};

const findPlanBySlug = (slug) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM plans WHERE slug = ?').get(slug);
  return row ? parsePlan(row) : null;
};

const findPlanById = (id) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM plans WHERE id = ?').get(id);
  return row ? parsePlan(row) : null;
};

module.exports = {
  listPlans,
  findPlanBySlug,
  findPlanById
};