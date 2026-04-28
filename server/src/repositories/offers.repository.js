const { getDb } = require('../config/db');

const offerSelect = `
  SELECT
    o.id,
    o.title,
    o.description,
    o.discount_percent,
    o.promo_code,
    o.starts_at,
    o.expiry_date,
    o.is_active,
    c.id AS company_id,
    c.name AS company_name,
    c.slug AS company_slug,
    c.logo_url,
    c.whatsapp_number,
    cat.slug AS category_slug
  FROM offers o
  JOIN companies c ON c.id = o.company_id
  JOIN categories cat ON cat.id = c.category_id
`;

const buildVisibilityConditions = (filters = {}) => {
  const conditions = [
    'o.is_active = 1',
    'c.is_active = 1',
    "datetime(o.starts_at) <= datetime('now')",
    "datetime(o.expiry_date) >= datetime('now')"
  ];
  const params = {};

  if (filters.company_id) {
    conditions.push('o.company_id = @company_id');
    params.company_id = Number(filters.company_id);
  }

  if (filters.category) {
    conditions.push('cat.slug = @category');
    params.category = filters.category;
  }

  if (filters.expires_before) {
    conditions.push('datetime(o.expiry_date) <= datetime(@expires_before)');
    params.expires_before = filters.expires_before;
  }

  return { conditions, params };
};

const listVisibleOffers = (filters = {}) => {
  const db = getDb();
  const { conditions, params } = buildVisibilityConditions(filters);
  return db.prepare(`
    ${offerSelect}
    WHERE ${conditions.join(' AND ')}
    ORDER BY datetime(o.expiry_date) ASC, o.title ASC
  `).all(params);
};

const findOfferById = (id) => {
  const db = getDb();
  return db.prepare(`
    ${offerSelect}
    WHERE o.id = ?
  `).get(id);
};

const listVisibleOffersByCompany = (companyId) => {
  return listVisibleOffers({ company_id: companyId });
};

const getLatestVisibleOffers = (limit = 4) => {
  const db = getDb();
  const { conditions, params } = buildVisibilityConditions({});
  return db.prepare(`
    ${offerSelect}
    WHERE ${conditions.join(' AND ')}
    ORDER BY datetime(o.created_at) DESC, datetime(o.expiry_date) ASC
    LIMIT @limit
  `).all({ ...params, limit });
};

module.exports = {
  listVisibleOffers,
  findOfferById,
  listVisibleOffersByCompany,
  getLatestVisibleOffers
};
