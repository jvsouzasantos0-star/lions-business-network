const {
  listCompanies,
  findCompanyById,
  findCompanyBySlug,
  getFeaturedCompanies,
  getCompanyOfWeek
} = require('../repositories/companies.repository');
const { listCategories } = require('../repositories/categories.repository');
const { listVisibleOffersByCompany } = require('../repositories/offers.repository');
const { createError } = require('../utils/errors');

const buildWhatsappUrl = (whatsappNumber) => {
  const text = encodeURIComponent('Olá! Encontrei sua empresa na Lions Business Network e gostaria de saber mais.');
  return `https://wa.me/${whatsappNumber}?text=${text}`;
};

const mapCompany = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  category: {
    id: row.category_id,
    name: row.category_name,
    slug: row.category_slug
  },
  description: row.description,
  phone: row.phone,
  whatsapp_number: row.whatsapp_number,
  whatsapp_url: buildWhatsappUrl(row.whatsapp_number),
  discount_percent: row.discount_percent,
  logo_url: row.logo_url,
  website_url: row.website_url,
  is_company_of_week: Boolean(row.is_company_of_week)
});

const mapCompanyOffer = (offer) => ({
  id: offer.id,
  title: offer.title,
  expiry_date: offer.expiry_date
});

const getCompanyDetail = (company) => {
  if (!company) {
    throw createError(404, 'NOT_FOUND', 'The requested resource was not found.');
  }

  return {
    ...mapCompany(company),
    offers: listVisibleOffersByCompany(company.id).map(mapCompanyOffer)
  };
};

module.exports = {
  listCompanies: (filters) => listCompanies(filters).map(mapCompany),
  getCompanyById: (id) => getCompanyDetail(findCompanyById(id)),
  getCompanyBySlug: (slug) => getCompanyDetail(findCompanyBySlug(slug)),
  listCategories,
  getFeaturedCompanies: () => getFeaturedCompanies().map(mapCompany),
  getCompanyOfWeek: () => {
    const company = getCompanyOfWeek();
    return company ? mapCompany(company) : null;
  }
};