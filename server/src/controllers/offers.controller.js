const { z } = require('zod');
const offersService = require('../services/offers.service');
const { fromZodError } = require('../utils/errors');

const listSchema = z.object({
  company_id: z.string().optional(),
  category: z.string().optional(),
  expires_before: z.string().optional()
});

const idSchema = z.object({
  id: z.coerce.number().int().positive()
});

const parse = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
};

const list = async (req, res, next) => {
  try {
    const filters = parse(listSchema, req.query);
    res.status(200).json({
      data: await offersService.listOffers(filters)
    });
  } catch (error) {
    next(error);
  }
};

const detail = async (req, res, next) => {
  try {
    const { id } = parse(idSchema, req.params);
    res.status(200).json({
      data: await offersService.getOfferById(id)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  detail
};
