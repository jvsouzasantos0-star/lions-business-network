const membershipService = require('../services/membership.service');

const list = (req, res, next) => {
  try {
    res.status(200).json({
      data: membershipService.listAvailablePlans()
    });
  } catch (error) {
    next(error);
  }
};

const me = (req, res, next) => {
  try {
    res.status(200).json({
      data: membershipService.getMyPlan(req.user.plan.id)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  me
};