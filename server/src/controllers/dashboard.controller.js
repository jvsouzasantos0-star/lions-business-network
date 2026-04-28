const dashboardService = require('../services/dashboard.service');

const getDashboard = async (req, res, next) => {
  try {
    res.status(200).json({
      data: await dashboardService.getDashboard(req.user)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard
};
