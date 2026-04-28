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

const listAllCompanies = () => {
  const db = getDb();
  return db.prepare(`${adminCompanySelect} ORDER BY c.name ASC`).all();
};

const findCompanyByIdAdmin = (id) => {
  const db = getDb();
  return db.prepare(`${adminCompanySelect} WHERE c.id = @id`).get({ id });
};

const findCompanyBySlugAdmin = (slug) => {
  const db = getDb();
  return db.prepare('SELECT id FROM companies WHERE slug = @slug').get({ slug });
};

const createCompany = (data) => {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO companies (
      name, slug, category_id, description, phone, whatsapp_number,
      discount_percent, logo_url, address, instagram, status,
      is_company_of_week, featured_order
    ) VALUES (
      @name, @slug, @category_id, @description, @phone, @whatsapp_number,
      @discount_percent, @logo_url, @address, @instagram, @status, 0, 0
    )
  `).run({
    name: data.name,
    slug: data.slug,
    category_id: data.category_id,
    description: data.description,
    phone: data.phone,
    whatsapp_number: data.whatsapp_number,
    discount_percent: data.discount_percent,
    logo_url: data.logo_url ?? null,
    address: data.address ?? null,
    instagram: data.instagram ?? null,
    status: data.status
  });
  return result.lastInsertRowid;
};

const updateCompany = (id, data) => {
  const db = getDb();
  db.prepare(`
    UPDATE companies
    SET
      name = @name,
      category_id = @category_id,
      description = @description,
      phone = @phone,
      whatsapp_number = @whatsapp_number,
      discount_percent = @discount_percent,
      logo_url = @logo_url,
      address = @address,
      instagram = @instagram,
      status = @status,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `).run({
    id,
    name: data.name,
    category_id: data.category_id,
    description: data.description,
    phone: data.phone,
    whatsapp_number: data.whatsapp_number,
    discount_percent: data.discount_percent,
    logo_url: data.logo_url ?? null,
    address: data.address ?? null,
    instagram: data.instagram ?? null,
    status: data.status
  });
};

const deleteCompany = (id) => {
  const db = getDb();
  db.prepare('DELETE FROM companies WHERE id = @id').run({ id });
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

const listAllOffers = () => {
  const db = getDb();
  return db.prepare(`${adminOfferSelect} ORDER BY o.title ASC`).all();
};

const findOfferByIdAdmin = (id) => {
  const db = getDb();
  return db.prepare(`${adminOfferSelect} WHERE o.id = @id`).get({ id });
};

const createOffer = (data) => {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO offers (
      company_id, title, description, discount_percent,
      starts_at, expiry_date, status, is_premium_only, is_active
    ) VALUES (
      @company_id, @title, @description, @discount_percent,
      @starts_at, @expiry_date, @status, 0, 1
    )
  `).run({
    company_id: data.company_id,
    title: data.title,
    description: data.description,
    discount_percent: data.discount_percent,
    starts_at: data.starts_at,
    expiry_date: data.expiry_date,
    status: data.status
  });
  return result.lastInsertRowid;
};

const updateOffer = (id, data) => {
  const db = getDb();
  db.prepare(`
    UPDATE offers
    SET
      company_id = @company_id,
      title = @title,
      description = @description,
      discount_percent = @discount_percent,
      starts_at = @starts_at,
      expiry_date = @expiry_date,
      status = @status,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `).run({
    id,
    company_id: data.company_id,
    title: data.title,
    description: data.description,
    discount_percent: data.discount_percent,
    starts_at: data.starts_at,
    expiry_date: data.expiry_date,
    status: data.status
  });
};

const deleteOffer = (id) => {
  const db = getDb();
  db.prepare('DELETE FROM offers WHERE id = @id').run({ id });
};

const getStats = () => {
  const db = getDb();
  const totalCompanies = db.prepare('SELECT COUNT(*) AS count FROM companies').get().count;
  const activeCompanies = db.prepare("SELECT COUNT(*) AS count FROM companies WHERE status = 'active'").get().count;
  const totalOffers = db.prepare('SELECT COUNT(*) AS count FROM offers').get().count;
  const activeOffers = db.prepare("SELECT COUNT(*) AS count FROM offers WHERE status = 'active'").get().count;
  const totalMembers = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'member'").get().count;
  return { totalCompanies, activeCompanies, totalOffers, activeOffers, totalMembers };
};

const createCategory = (data) => {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO categories (name, slug, sort_order)
    VALUES (@name, @slug, @sort_order)
  `).run({ name: data.name, slug: data.slug, sort_order: data.sort_order ?? 0 });
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
