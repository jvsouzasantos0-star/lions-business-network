const { z } = require('zod');
const companiesService = require('../services/companies.service');
const { fromZodError } = require('../utils/errors');

const listSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  featured: z.enum(['true', 'false']).optional()
});

const getIdSchema = z.object({
  id: z.coerce.number().int().positive()
});

const getSlugSchema = z.object({
  slug: z.string().min(1)
});

const parse = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
};

const list = (req, res, next) => {
  try {
    const filters = parse(listSchema, req.query);
    res.status(200).json({
      data: companiesService.listCompanies({
        category: filters.category,
        search: filters.search,
        featured: filters.featured === 'true'
      })
    });
  } catch (error) {
    next(error);
  }
};

const detailById = (req, res, next) => {
  try {
    const { id } = parse(getIdSchema, req.params);
    res.status(200).json({
      data: companiesService.getCompanyById(id)
    });
  } catch (error) {
    next(error);
  }
};

const detailBySlug = (req, res, next) => {
  try {
    const { slug } = parse(getSlugSchema, req.params);
    res.status(200).json({
      data: companiesService.getCompanyBySlug(slug)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  detailById,
  detailBySlug
};