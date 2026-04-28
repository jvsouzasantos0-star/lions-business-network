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

const listCompanies = ({ category, search, featured }) => {
  const db = getDb();
  const conditions = ['c.is_active = 1'];
  const params = {};

  if (category) {
    conditions.push('cat.slug = @category');
    params.category = category;
  }

  if (search) {
    conditions.push('LOWER(c.name) LIKE @search');
    params.search = `%${search.toLowerCase()}%`;
  }

  if (featured) {
    conditions.push('(c.is_company_of_week = 1 OR c.featured_order > 0)');
  }

  return db.prepare(`
    ${baseSelect}
    WHERE ${conditions.join(' AND ')}
    ORDER BY c.is_company_of_week DESC, c.featured_order ASC, c.name ASC
  `).all(params);
};

const findCompanyById = (id) => {
  const db = getDb();
  return db.prepare(`
    ${baseSelect}
    WHERE c.id = ? AND c.is_active = 1
  `).get(id);
};

const findCompanyBySlug = (slug) => {
  const db = getDb();
  return db.prepare(`
    ${baseSelect}
    WHERE c.slug = ? AND c.is_active = 1
  `).get(slug);
};

const getCompanyOfWeek = () => {
  const db = getDb();
  return db.prepare(`
    ${baseSelect}
    WHERE c.is_active = 1
    ORDER BY c.is_company_of_week DESC, c.featured_order ASC, c.name ASC
    LIMIT 1
  `).get();
};

const getFeaturedCompanies = (limit = 4) => {
  const db = getDb();
  return db.prepare(`
    ${baseSelect}
    WHERE c.is_active = 1
    ORDER BY c.is_company_of_week DESC, c.featured_order ASC, c.name ASC
    LIMIT ?
  `).all(limit);
};

module.exports = {
  listCompanies,
  findCompanyById,
  findCompanyBySlug,
  getCompanyOfWeek,
  getFeaturedCompanies
};