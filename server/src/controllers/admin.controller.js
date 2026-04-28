const { z } = require('zod');
const { fromZodError, createError } = require('../utils/errors');
const { slugify } = require('../utils/slug');
const { listCategories } = require('../repositories/categories.repository');
const adminRepo = require('../repositories/admin.repository');

const parse = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) throw fromZodError(result.error);
  return result.data;
};

const idSchema = z.object({
  id: z.coerce.number().int().positive()
});

// ── Company schemas ──────────────────────────────────────────────────────────

const companyBodySchema = z.object({
  name: z.string().min(1),
  category_id: z.coerce.number().int().positive(),
  description: z.string().default(''),
  phone: z.string().default(''),
  whatsapp_number: z.string().default(''),
  discount_percent: z.coerce.number().int().min(0).max(100).default(0),
  logo_url: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive']).default('active')
});

// ── Company handlers ─────────────────────────────────────────────────────────

const listAdminCompanies = (req, res, next) => {
  try {
    res.status(200).json({ data: adminRepo.listAllCompanies() });
  } catch (error) {
    next(error);
  }
};

const createCompany = (req, res, next) => {
  try {
    const data = parse(companyBodySchema, req.body);
    const baseSlug = slugify(data.name);
    const existing = adminRepo.findCompanyBySlugAdmin(baseSlug);
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;
    const id = adminRepo.createCompany({ ...data, slug });
    const company = adminRepo.findCompanyByIdAdmin(id);
    res.status(201).json({ data: company });
  } catch (error) {
    next(error);
  }
};

const getCompany = (req, res, next) => {
  try {
    const { id } = parse(idSchema, req.params);
    const company = adminRepo.findCompanyByIdAdmin(id);
    if (!company) throw createError(404, 'NOT_FOUND', 'Company not found.');
    res.status(200).json({ data: company });
  } catch (error) {
    next(error);
  }
};

const updateCompany = (req, res, next) => {
  try {
    const { id } = parse(idSchema, req.params);
    const existing = adminRepo.findCompanyByIdAdmin(id);
    if (!existing) throw createError(404, 'NOT_FOUND', 'Company not found.');
    const data = parse(companyBodySchema, req.body);
    adminRepo.updateCompany(id, data);
    const updated = adminRepo.findCompanyByIdAdmin(id);
    res.status(200).json({ data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteCompany = (req, res, next) => {
  try {
    const { id } = parse(idSchema, req.params);
    const existing = adminRepo.findCompanyByIdAdmin(id);
    if (!existing) throw createError(404, 'NOT_FOUND', 'Company not found.');
    adminRepo.deleteCompany(id);
    res.status(200).json({ data: { message: 'Company deleted.' } });
  } catch (error) {
    next(error);
  }
};

// ── Offer schemas ─────────────────────────────────────────────────────────────

const offerBodySchema = z.object({
  title: z.string().min(1),
  company_id: z.coerce.number().int().positive(),
  description: z.string().default(''),
  discount_percent: z.coerce.number().int().min(0).max(100).default(0),
  starts_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive']).default('active')
});

const todayStr = () => new Date().toISOString().slice(0, 10);

// ── Offer handlers ────────────────────────────────────────────────────────────

const listAdminOffers = (req, res, next) => {
  try {
    res.status(200).json({ data: adminRepo.listAllOffers() });
  } catch (error) {
    next(error);
  }
};

const createOffer = (req, res, next) => {
  try {
    const data = parse(offerBodySchema, req.body);
    const { expires_at, starts_at, ...rest } = data;
    const id = adminRepo.createOffer({
      ...rest,
      starts_at: starts_at || todayStr(),
      expiry_date: expires_at || todayStr()
    });
    const offer = adminRepo.findOfferByIdAdmin(id);
    res.status(201).json({ data: offer });
  } catch (error) {
    next(error);
  }
};

const getOffer = (req, res, next) => {
  try {
    const { id } = parse(idSchema, req.params);
    const offer = adminRepo.findOfferByIdAdmin(id);
    if (!offer) throw createError(404, 'NOT_FOUND', 'Offer not found.');
    res.status(200).json({ data: offer });
  } catch (error) {
    next(error);
  }
};

const updateOffer = (req, res, next) => {
  try {
    const { id } = parse(idSchema, req.params);
    const existing = adminRepo.findOfferByIdAdmin(id);
    if (!existing) throw createError(404, 'NOT_FOUND', 'Offer not found.');
    const data = parse(offerBodySchema, req.body);
    const { expires_at, starts_at, ...rest } = data;
    adminRepo.updateOffer(id, {
      ...rest,
      starts_at: starts_at || existing.starts_at || todayStr(),
      expiry_date: expires_at || existing.expiry_date || todayStr()
    });
    const updated = adminRepo.findOfferByIdAdmin(id);
    res.status(200).json({ data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteOffer = (req, res, next) => {
  try {
    const { id } = parse(idSchema, req.params);
    const existing = adminRepo.findOfferByIdAdmin(id);
    if (!existing) throw createError(404, 'NOT_FOUND', 'Offer not found.');
    adminRepo.deleteOffer(id);
    res.status(200).json({ data: { message: 'Offer deleted.' } });
  } catch (error) {
    next(error);
  }
};

// ── Stats handler ─────────────────────────────────────────────────────────────

const getStats = (req, res, next) => {
  try {
    res.status(200).json({ data: adminRepo.getStats() });
  } catch (error) {
    next(error);
  }
};

// ── Category handlers ─────────────────────────────────────────────────────────

const listAdminCategories = (req, res, next) => {
  try {
    res.status(200).json({ data: listCategories() });
  } catch (error) {
    next(error);
  }
};

const categoryBodySchema = z.object({
  name: z.string().min(1),
  sort_order: z.coerce.number().int().optional().default(0)
});

const createCategory = (req, res, next) => {
  try {
    const data = parse(categoryBodySchema, req.body);
    const slug = slugify(data.name);
    const id = adminRepo.createCategory({ name: data.name, slug, sort_order: data.sort_order });
    const all = listCategories();
    const category = all.find((c) => c.id === Number(id));
    res.status(201).json({ data: category });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listAdminCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  listAdminOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  getStats,
  listAdminCategories,
  createCategory
};
