const { getDb } = require('../config/db');

const listCategories = async () => {
  const db = getDb();
  return db.query(
    `SELECT id, name, slug, sort_order FROM categories ORDER BY sort_order ASC, name ASC`
  );
};

module.exports = {
  listCategories
};
