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
    "o.status = 'active'",
    "c.status = 'active'",
    'o.starts_at <= NOW()',
    'o.expiry_date >= NOW()'
  ];
  const params = [];
  let idx = 1;

  if (filters.company_id) {
    conditions.push(`o.company_id = $${idx++}`);
    params.push(Number(filters.company_id));
  }

  if (filters.category) {
    conditions.push(`cat.slug = $${idx++}`);
    params.push(filters.category);
  }

  if (filters.expires_before) {
    conditions.push(`o.expiry_date <= $${idx++}`);
    params.push(filters.expires_before);
  }

  return { conditions, params };
};

const listVisibleOffers = async (filters = {}) => {
  const db = getDb();
  const { conditions, params } = buildVisibilityConditions(filters);
  return db.query(
    `${offerSelect}
     WHERE ${conditions.join(' AND ')}
     ORDER BY o.expiry_date ASC, o.title ASC`,
    params
  );
};

const findOfferById = async (id) => {
  const db = getDb();
  return db.queryOne(
    `${offerSelect} WHERE o.id = $1`,
    [id]
  );
};

const listVisibleOffersByCompany = (companyId) => {
  return listVisibleOffers({ company_id: companyId });
};

const getLatestVisibleOffers = async (limit = 4) => {
  const db = getDb();
  const { conditions, params } = buildVisibilityConditions({});
  const limitIdx = params.length + 1;
  return db.query(
    `${offerSelect}
     WHERE ${conditions.join(' AND ')}
     ORDER BY o.created_at DESC, o.expiry_date ASC
     LIMIT $${limitIdx}`,
    [...params, limit]
  );
};

module.exports = {
  listVisibleOffers,
  findOfferById,
  listVisibleOffersByCompany,
  getLatestVisibleOffers
};
