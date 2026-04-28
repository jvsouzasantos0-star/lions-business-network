const { getDb } = require('../config/db');

const listVisibleContent = () => {
  const db = getDb();
  return db.prepare(`
    SELECT id, title, slug, summary, access_level, published_at
    FROM member_contents
    WHERE is_active = 1
    ORDER BY datetime(published_at) DESC
  `).all();
};

const findContentBySlug = (slug) => {
  const db = getDb();
  return db.prepare(`
    SELECT id, title, slug, summary, body_html, access_level, published_at, is_active
    FROM member_contents
    WHERE slug = ?
  `).get(slug);
};

const listMemberHighlights = (limit = 3) => {
  const db = getDb();
  return db.prepare(`
    SELECT id, title, slug, summary, access_level, published_at
    FROM member_contents
    WHERE is_active = 1
    ORDER BY datetime(published_at) DESC
    LIMIT ?
  `).all(limit);
};

module.exports = {
  listVisibleContent,
  findContentBySlug,
  listMemberHighlights
};
