const { z } = require('zod');
const authService = require('../services/auth.service');
const { fromZodError } = require('../utils/errors');

const registerSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8)
});

const refreshSchema = z.object({
  refresh_token: z.string().min(20)
});

const logoutSchema = z.object({
  refresh_token: z.string().min(20).optional()
}).optional();

const getContext = (req) => ({
  ipAddress: req.ip,
  userAgent: req.get('user-agent') || 'Unknown'
});

const parse = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
};

const register = async (req, res, next) => {
  try {
    const payload = parse(registerSchema, req.body);
    const result = await authService.register(payload, getContext(req));
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const payload = parse(loginSchema, req.body);
    const result = await authService.login(payload, getContext(req));
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const payload = parse(refreshSchema, req.body);
    const result = await authService.refresh(payload, getContext(req));
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    parse(logoutSchema, req.body);
    const result = await authService.logout(req.user);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const result = await authService.getCurrentUser(req.user.id);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};