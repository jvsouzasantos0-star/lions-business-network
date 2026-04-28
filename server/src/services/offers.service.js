const { listVisibleOffers, findOfferById } = require('../repositories/offers.repository');
const { createError } = require('../utils/errors');

const mapOffer = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  discount_percent: row.discount_percent,
  promo_code: row.promo_code,
  starts_at: row.starts_at,
  expiry_date: row.expiry_date,
  company: {
    id: row.company_id,
    name: row.company_name,
    slug: row.company_slug,
    logo_url: row.logo_url
  }
});

const listOffers = async (filters) => {
  const rows = await listVisibleOffers(filters);
  return rows.map(mapOffer);
};

const getOfferById = async (id) => {
  const offer = await findOfferById(id);
  if (!offer || !offer.company_id) {
    throw createError(404, 'NOT_FOUND', 'The requested resource was not found.');
  }

  const hasStarted = new Date(offer.starts_at).getTime() <= Date.now();
  const isExpired = new Date(offer.expiry_date).getTime() < Date.now();
  if (offer.status !== 'active' || !hasStarted || isExpired) {
    throw createError(404, 'NOT_FOUND', 'The requested resource was not found.');
  }

  return mapOffer(offer);
};

module.exports = {
  listOffers,
  getOfferById
};
