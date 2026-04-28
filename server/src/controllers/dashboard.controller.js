const dashboardService = require('../services/dashboard.service');

const getDashboard = (req, res, next) => {
  try {
    res.status(200).json({
      data: dashboardService.getDashboard(req.user)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard
};