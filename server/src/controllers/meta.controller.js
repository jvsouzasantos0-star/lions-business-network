const pwaAssetService = require('../services/pwa-asset.service');

const manifest = (req, res, next) => {
  try {
    res.status(200).json({
      data: pwaAssetService.getManifestMeta()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  manifest
};