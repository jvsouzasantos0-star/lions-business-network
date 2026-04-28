const { getDb } = require('../config/db');

const adminCompanySelect = `
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
    c.address,
    c.instagram,
    c.status,
    c.is_company_of_week,
    c.featured_order,
    cat.id AS category_id,
    cat.name AS category_name,
    cat.slug AS category_slug
  FROM companies c
  JOIN categories cat ON cat.id = c.category_id
`;

const listAllCompanies = async () => {
  const db = getDb();
  return db.query(`${adminCompanySelect} ORDER BY c.name ASC`);
};

const findCompanyByIdAdmin = async (id) => {
  const db = getDb();
  return db.queryOne(`${adminCompanySelect} WHERE c.id = $1`, [id]);
};

const findCompanyBySlugAdmin = async (slug) => {
  const db = getDb();
  return db.queryOne('SELECT id FROM companies WHERE slug = $1', [slug]);
};

const createCompany = async (data) => {
  const db = getDb();
  const result = await db.run(
    `INSERT INTO companies (
      name, slug, category_id, description, phone, whatsapp_number,
      discount_percent, logo_url, address, instagram, status,
      is_company_of_week, featured_order
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, 0)`,
    [
      data.name,
      data.slug,
      data.category_id,
      data.description,
      data.phone,
      data.whatsapp_number,
      data.discount_percent,
      data.logo_url ?? null,
      data.address ?? null,
      data.instagram ?? null,
      data.status
    ]
  );
  return result.lastInsertRowid;
};

const updateCompany = async (id, data) => {
  const db = getDb();
  await db.run(
    `UPDATE companies
     SET
       name = $1,
       category_id = $2,
       description = $3,
       phone = $4,
       whatsapp_number = $5,
       discount_percent = $6,
       logo_url = $7,
       address = $8,
       instagram = $9,
       status = $10,
       updated_at = NOW()
     WHERE id = $11`,
    [
      data.name,
      data.category_id,
      data.description,
      data.phone,
      data.whatsapp_number,
      data.discount_percent,
      data.logo_url ?? null,
      data.address ?? null,
      data.instagram ?? null,
      data.status,
      id
    ]
  );
};

const deleteCompany = async (id) => {
  const db = getDb();
  await db.run('DELETE FROM companies WHERE id = $1', [id]);
};

const adminOfferSelect = `
  SELECT
    o.id,
    o.title,
    o.description,
    o.discount_percent,
    o.promo_code,
    o.starts_at,
    o.expiry_date,
    o.status,
    c.id AS company_id,
    c.name AS company_name,
    c.slug AS company_slug,
    c.logo_url
  FROM offers o
  JOIN companies c ON c.id = o.company_id
`;

const listAllOffers = async () => {
  const db = getDb();
  return db.query(`${adminOfferSelect} ORDER BY o.title ASC`);
};

const findOfferByIdAdmin = async (id) => {
  const db = getDb();
  return db.queryOne(`${adminOfferSelect} WHERE o.id = $1`, [id]);
};

const createOffer = async (data) => {
  const db = getDb();
  const result = await db.run(
    `INSERT INTO offers (
      company_id, title, description, discount_percent,
      starts_at, expiry_date, status, is_premium_only, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, true)`,
    [
      data.company_id,
      data.title,
      data.description,
      data.discount_percent,
      data.starts_at,
      data.expiry_date,
      data.status
    ]
  );
  return result.lastInsertRowid;
};

const updateOffer = async (id, data) => {
  const db = getDb();
  await db.run(
    `UPDATE offers
     SET
       company_id = $1,
       title = $2,
       description = $3,
       discount_percent = $4,
       starts_at = $5,
       expiry_date = $6,
       status = $7,
       updated_at = NOW()
     WHERE id = $8`,
    [
      data.company_id,
      data.title,
      data.description,
      data.discount_percent,
      data.starts_at,
      data.expiry_date,
      data.status,
      id
    ]
  );
};

const deleteOffer = async (id) => {
  const db = getDb();
  await db.run('DELETE FROM offers WHERE id = $1', [id]);
};

const getStats = async () => {
  const db = getDb();
  const [totalComp, activeComp, totalOffers, activeOffers, totalMembers] = await Promise.all([
    db.queryOne('SELECT COUNT(*) AS count FROM companies'),
    db.queryOne("SELECT COUNT(*) AS count FROM companies WHERE status = 'active'"),
    db.queryOne('SELECT COUNT(*) AS count FROM offers'),
    db.queryOne("SELECT COUNT(*) AS count FROM offers WHERE status = 'active'"),
    db.queryOne("SELECT COUNT(*) AS count FROM users WHERE role = 'member'")
  ]);

  return {
    totalCompanies: Number(totalComp.count),
    activeCompanies: Number(activeComp.count),
    totalOffers: Number(totalOffers.count),
    activeOffers: Number(activeOffers.count),
    totalMembers: Number(totalMembers.count)
  };
};

const createCategory = async (data) => {
  const db = getDb();
  const result = await db.run(
    'INSERT INTO categories (name, slug, sort_order) VALUES ($1, $2, $3)',
    [data.name, data.slug, data.sort_order ?? 0]
  );
  return result.lastInsertRowid;
};

module.exports = {
  listAllCompanies,
  findCompanyByIdAdmin,
  findCompanyBySlugAdmin,
  createCompany,
  updateCompany,
  deleteCompany,
  listAllOffers,
  findOfferByIdAdmin,
  createOffer,
  updateOffer,
  deleteOffer,
  getStats,
  createCategory
};
