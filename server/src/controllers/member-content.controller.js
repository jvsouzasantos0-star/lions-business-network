const membershipService = require('../services/membership.service');

const list = (req, res, next) => {
  try {
    res.status(200).json({
      data: membershipService.listMemberContent()
    });
  } catch (error) {
    next(error);
  }
};

const detail = (req, res, next) => {
  try {
    res.status(200).json({
      data: membershipService.getMemberContent(req.params.slug)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  detail
};
