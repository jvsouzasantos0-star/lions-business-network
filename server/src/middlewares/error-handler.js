const { AppError } = require('../utils/errors');

const errorHandler = (error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details || []
      }
    });
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error.',
      details: []
    }
  });
};

module.exports = {
  errorHandler
};