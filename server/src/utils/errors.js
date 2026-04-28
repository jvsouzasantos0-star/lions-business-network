class AppError extends Error {
  constructor(statusCode, code, message, details = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const createError = (statusCode, code, message, details = []) => {
  return new AppError(statusCode, code, message, details);
};

const validationError = (issues) => {
  return createError(400, 'VALIDATION_ERROR', 'The provided data is invalid.', issues);
};

const fromZodError = (error) => {
  const details = error.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message
  }));

  return validationError(details);
};

module.exports = {
  AppError,
  createError,
  validationError,
  fromZodError
};