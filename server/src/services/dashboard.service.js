const companiesService = require('./companies.service');
const { getLatestVisibleOffers } = require('../repositories/offers.repository');
const { listMemberHighlights } = require('../repositories/member-content.repository');

const mapDashboardOffer = (offer) => ({
  id: offer.id,
  title: offer.title,
  description: offer.description,
  discount_percent: offer.discount_percent,
  promo_code: offer.promo_code,
  starts_at: offer.starts_at,
  expiry_date: offer.expiry_date,
  company: {
    id: offer.company_id,
    name: offer.company_name,
    slug: offer.company_slug,
    logo_url: offer.logo_url
  }
});

const getDashboard = (user) => {
  const firstName = user.full_name.split(' ')[0];

  return {
    user: {
      first_name: firstName,
      plan_slug: user.plan.slug
    },
    company_of_the_week: companiesService.getCompanyOfWeek(),
    featured_companies: companiesService.getFeaturedCompanies(),
    latest_offers: getLatestVisibleOffers().map(mapDashboardOffer),
    member_highlights: listMemberHighlights(),
    categories: companiesService.listCategories(),
    membership_summary: {
      plan_name: user.plan.name,
      benefits_count: user.plan.benefits.length
    }
  };
};

module.exports = {
  getDashboard
};
