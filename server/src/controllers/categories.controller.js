const companiesService = require('../services/companies.service');

const list = (req, res, next) => {
  try {
    res.status(200).json({
      data: companiesService.listCategories()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list
};