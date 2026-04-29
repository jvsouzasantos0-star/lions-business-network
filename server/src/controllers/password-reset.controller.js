const { z } = require('zod');
const passwordResetService = require('../services/password-reset.service');
const { fromZodError } = require('../utils/errors');

const forgotSchema = z.object({
  email: z.string().trim().email()
});

const verifySchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().length(6).regex(/^\d{6}$/, 'Codigo deve ter 6 digitos numericos')
});

const resetSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().length(6).regex(/^\d{6}$/, 'Codigo deve ter 6 digitos numericos'),
  new_password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
});

const parse = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) throw fromZodError(result.error);
  return result.data;
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = parse(forgotSchema, req.body);
    const result = await passwordResetService.requestReset(email);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const verifyResetCode = async (req, res, next) => {
  try {
    const { email, code } = parse(verifySchema, req.body);
    const result = await passwordResetService.verifyCode(email, code);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, code, new_password } = parse(resetSchema, req.body);
    const result = await passwordResetService.resetPassword(email, code, new_password);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { forgotPassword, verifyResetCode, resetPassword };
