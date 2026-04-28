const membershipService = require('../services/membership.service');

const list = async (req, res, next) => {
  try {
    res.status(200).json({
      data: await membershipService.listMemberContent()
    });
  } catch (error) {
    next(error);
  }
};

const detail = async (req, res, next) => {
  try {
    res.status(200).json({
      data: await membershipService.getMemberContent(req.params.slug)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  detail
};
