const { listVisibleContent, findContentBySlug } = require('../repositories/member-content.repository');
const { listPlans, findPlanById } = require('../repositories/plans.repository');
const { createError } = require('../utils/errors');

const listMemberContent = async () => {
  return listVisibleContent();
};

const getMemberContent = async (slug) => {
  const content = await findContentBySlug(slug);
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

const getMyPlan = async (planId) => {
  const plan = await findPlanById(planId);
  if (!plan) {
    throw createError(404, 'NOT_FOUND', 'The requested resource was not found.');
  }

  return { plan };
};

const listAvailablePlans = async () => {
  return listPlans();
};

module.exports = {
  listMemberContent,
  getMemberContent,
  getMyPlan,
  listAvailablePlans
};
