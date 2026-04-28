const companiesService = require('../services/companies.service');

const list = async (req, res, next) => {
  try {
    res.status(200).json({
      data: await companiesService.listCategories()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list
};
