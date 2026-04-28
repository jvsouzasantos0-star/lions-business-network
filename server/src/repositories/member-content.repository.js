const { getDb } = require('../config/db');

const listVisibleContent = async () => {
  const db = getDb();
  return db.query(
    `SELECT id, title, slug, summary, access_level, published_at
     FROM member_contents
     WHERE is_active = true
     ORDER BY published_at DESC`
  );
};

const findContentBySlug = async (slug) => {
  const db = getDb();
  return db.queryOne(
    `SELECT id, title, slug, summary, body_html, access_level, published_at, is_active
     FROM member_contents
     WHERE slug = $1`,
    [slug]
  );
};

const listMemberHighlights = async (limit = 3) => {
  const db = getDb();
  return db.query(
    `SELECT id, title, slug, summary, access_level, published_at
     FROM member_contents
     WHERE is_active = true
     ORDER BY published_at DESC
     LIMIT $1`,
    [limit]
  );
};

module.exports = {
  listVisibleContent,
  findContentBySlug,
  listMemberHighlights
};
