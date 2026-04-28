const { getDb } = require('../config/db');

const listCategories = () => {
  const db = getDb();
  return db.prepare(`
    SELECT id, name, slug, sort_order
    FROM categories
    ORDER BY sort_order ASC, name ASC
  `).all();
};

module.exports = {
  listCategories
};