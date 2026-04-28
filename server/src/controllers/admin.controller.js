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

const listAdminCompanies = async (req, res, next) => {
  try {
    res.status(200).json({ data: await adminRepo.listAllCompanies() });
  } catch (error) {
    next(error);
  }
};

const createCompany = async (req, res, next) => {
  try {
    const data = parse(companyBodySchema, req.body);
    const baseSlug = slugify(data.name);
    const existing = await adminRepo.findCompanyBySlugAdmin(baseSlug);
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;
    const id = await adminRepo.createCompany({ ...data, slug });
    const company = await adminRepo.findCompanyByIdAdmin(id);
    res.status(201).json({ data: company });
  } catch (error) {
    next(error);
  }
};

const getCompany = async (req, res, next) => {
  try {
    const { id } = parse(idSchema, req.params);
    const company = await adminRepo.findCompanyByIdAdmin(id);
    if (!company) throw createError(404, 'NOT_FOUND', 'Company not found.');
    res.status(200).json({ data: company });
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const { id } = parse(idSchema, req.params);
    const existing = await adminRepo.findCompanyByIdAdmin(id);
    if (!existing) throw createError(404, 'NOT_FOUND', 'Company not found.');
    const data = parse(companyBodySchema, req.body);
    await adminRepo.updateCompany(id, data);
    const updated = await adminRepo.findCompanyByIdAdmin(id);
    res.status(200).json({ data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    const { id } = parse(idSchema, req.params);
    const existing = await adminRepo.findCompanyByIdAdmin(id);
    if (!existing) throw createError(404, 'NOT_FOUND', 'Company not found.');
    await adminRepo.deleteCompany(id);
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

const listAdminOffers = async (req, res, next) => {
  try {
    res.status(200).json({ data: await adminRepo.listAllOffers() });
  } catch (error) {
    next(error);
  }
};

const createOffer = async (req, res, next) => {
  try {
    const data = parse(offerBodySchema, req.body);
    const { expires_at, starts_at, ...rest } = data;
    const id = await adminRepo.createOffer({
      ...rest,
      starts_at: starts_at || todayStr(),
      expiry_date: expires_at || todayStr()
    });
    const offer = await adminRepo.findOfferByIdAdmin(id);
    res.status(201).json({ data: offer });
  } catch (error) {
    next(error);
  }
};

const getOffer = async (req, res, next) => {
  try {
    const { id } = parse(idSchema, req.params);
    const offer = await adminRepo.findOfferByIdAdmin(id);
    if (!offer) throw createError(404, 'NOT_FOUND', 'Offer not found.');
    res.status(200).json({ data: offer });
  } catch (error) {
    next(error);
  }
};

const updateOffer = async (req, res, next) => {
  try {
    const { id } = parse(idSchema, req.params);
    const existing = await adminRepo.findOfferByIdAdmin(id);
    if (!existing) throw createError(404, 'NOT_FOUND', 'Offer not found.');
    const data = parse(offerBodySchema, req.body);
    const { expires_at, starts_at, ...rest } = data;
    await adminRepo.updateOffer(id, {
      ...rest,
      starts_at: starts_at || existing.starts_at || todayStr(),
      expiry_date: expires_at || existing.expiry_date || todayStr()
    });
    const updated = await adminRepo.findOfferByIdAdmin(id);
    res.status(200).json({ data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteOffer = async (req, res, next) => {
  try {
    const { id } = parse(idSchema, req.params);
    const existing = await adminRepo.findOfferByIdAdmin(id);
    if (!existing) throw createError(404, 'NOT_FOUND', 'Offer not found.');
    await adminRepo.deleteOffer(id);
    res.status(200).json({ data: { message: 'Offer deleted.' } });
  } catch (error) {
    next(error);
  }
};

// ── Stats handler ─────────────────────────────────────────────────────────────

const getStats = async (req, res, next) => {
  try {
    res.status(200).json({ data: await adminRepo.getStats() });
  } catch (error) {
    next(error);
  }
};

// ── Category handlers ─────────────────────────────────────────────────────────

const listAdminCategories = async (req, res, next) => {
  try {
    res.status(200).json({ data: await listCategories() });
  } catch (error) {
    next(error);
  }
};

const categoryBodySchema = z.object({
  name: z.string().min(1),
  sort_order: z.coerce.number().int().optional().default(0)
});

const createCategory = async (req, res, next) => {
  try {
    const data = parse(categoryBodySchema, req.body);
    const slug = slugify(data.name);
    const id = await adminRepo.createCategory({ name: data.name, slug, sort_order: data.sort_order });
    const all = await listCategories();
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
