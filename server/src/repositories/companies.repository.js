const { getDb } = require('../config/db');

const baseSelect = `
  SELECT
    c.id,
    c.name,
    c.slug,
    c.description,
    c.phone,
    c.whatsapp_number,
    c.discount_percent,
    c.logo_url,
    c.website_url,
    c.is_company_of_week,
    c.featured_order,
    cat.id AS category_id,
    cat.name AS category_name,
    cat.slug AS category_slug
  FROM companies c
  JOIN categories cat ON cat.id = c.category_id
`;

const listCompanies = async ({ category, search, featured }) => {
  const db = getDb();
  const conditions = ["c.status = 'active'"];
  const params = [];
  let idx = 1;

  if (category) {
    conditions.push(`cat.slug = $${idx++}`);
    params.push(category);
  }

  if (search) {
    conditions.push(`LOWER(c.name) LIKE $${idx++}`);
    params.push(`%${search.toLowerCase()}%`);
  }

  if (featured) {
    conditions.push('(c.is_company_of_week = true OR c.featured_order > 0)');
  }

  return db.query(
    `${baseSelect}
     WHERE ${conditions.join(' AND ')}
     ORDER BY c.is_company_of_week DESC, c.featured_order ASC, c.name ASC`,
    params
  );
};

const findCompanyById = async (id) => {
  const db = getDb();
  return db.queryOne(
    `${baseSelect} WHERE c.id = $1 AND c.status = 'active'`,
    [id]
  );
};

const findCompanyBySlug = async (slug) => {
  const db = getDb();
  return db.queryOne(
    `${baseSelect} WHERE c.slug = $1 AND c.status = 'active'`,
    [slug]
  );
};

const getCompanyOfWeek = async () => {
  const db = getDb();
  return db.queryOne(
    `${baseSelect}
     WHERE c.status = 'active'
     ORDER BY c.is_company_of_week DESC, c.featured_order ASC, c.name ASC
     LIMIT 1`,
    []
  );
};

const getFeaturedCompanies = async (limit = 4) => {
  const db = getDb();
  return db.query(
    `${baseSelect}
     WHERE c.status = 'active'
     ORDER BY c.is_company_of_week DESC, c.featured_order ASC, c.name ASC
     LIMIT $1`,
    [limit]
  );
};

module.exports = {
  listCompanies,
  findCompanyById,
  findCompanyBySlug,
  getCompanyOfWeek,
  getFeaturedCompanies
};
