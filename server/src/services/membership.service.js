const { listVisibleContent, findContentBySlug } = require('../repositories/member-content.repository');
const { listPlans, findPlanById } = require('../repositories/plans.repository');
const { createError } = require('../utils/errors');

const listMemberContent = () => {
  return listVisibleContent();
};

const getMemberContent = (slug) => {
  const content = findContentBySlug(slug);
  if (!content || !content.is_active) {
    throw createError(404, 'NOT_FOUND', 'The requested resource was not found.');
  }

  return {
    id: content.id,
    title: content.title,
    slug: content.slug,
    summary: content.summary,
    body_html: content.body_html,
    access_level: content.access_level,
    published_at: content.published_at
  };
};

const getMyPlan = (planId) => {
  const plan = findPlanById(planId);
  if (!plan) {
    throw createError(404, 'NOT_FOUND', 'The requested resource was not found.');
  }

  return { plan };
};

const listAvailablePlans = () => {
  return listPlans();
};

module.exports = {
  listMemberContent,
  getMemberContent,
  getMyPlan,
  listAvailablePlans
};
