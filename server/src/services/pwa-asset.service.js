const { listAvailablePlans } = require('./membership.service');

const getManifestMeta = () => ({
  app_name: 'Lions Business Network',
  theme_color: '#000000',
  accent_color: '#00FF66',
  support_whatsapp: true,
  plans: listAvailablePlans().map((plan) => ({
    slug: plan.slug,
    name: plan.name
  }))
});

module.exports = {
  getManifestMeta
};