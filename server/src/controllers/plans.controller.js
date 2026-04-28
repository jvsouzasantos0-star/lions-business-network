const membershipService = require('../services/membership.service');

const list = async (req, res, next) => {
  try {
    res.status(200).json({
      data: await membershipService.listAvailablePlans()
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    res.status(200).json({
      data: await membershipService.getMyPlan(req.user.plan.id)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  me
};
