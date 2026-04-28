const {
  findUserByEmail,
  createUser,
  updateLastLogin,
  findUserProfileById
} = require('../repositories/users.repository');
const { findPlanBySlug } = require('../repositories/plans.repository');
const {
  createSession,
  findRefreshSession,
  rotateSession,
  revokeSessionByJti
} = require('../repositories/auth-sessions.repository');
const { hashPassword, comparePassword } = require('../utils/password');
const { createError } = require('../utils/errors');
const { createSessionIdentifiers, durationToSeconds, signAccessToken, hashToken } = require('../utils/jwt');

const buildExpiresAt = (seconds) => {
  return new Date(Date.now() + seconds * 1000).toISOString();
};

const toAuthUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  status: user.status,
  plan: {
    id: user.plan.id,
    slug: user.plan.slug,
    name: user.plan.name,
    is_premium: user.plan.is_premium,
    benefits: user.plan.benefits,
    price_cents: user.plan.price_cents,
    billing_cycle: user.plan.billing_cycle
  }
});

const buildTokenPayload = (user, jti) => ({
  sub: String(user.id),
  email: user.email,
  plan: user.plan.slug,
  role: user.role,
  jti
});

const issueSession = async ({ user, ipAddress, userAgent, sessionId }) => {
  const accessTokenSeconds = durationToSeconds(process.env.JWT_EXPIRES_IN || '15m');
  const refreshTokenSeconds = durationToSeconds(process.env.REFRESH_TOKEN_EXPIRES_IN || '30d');
  const identifiers = createSessionIdentifiers();

  if (sessionId) {
    await rotateSession({
      session_id: sessionId,
      token_jti: identifiers.jti,
      refresh_token_hash: hashToken(identifiers.refreshToken),
      expires_at: buildExpiresAt(refreshTokenSeconds),
      ip_address: ipAddress,
      user_agent: userAgent
    });
  } else {
    await createSession({
      user_id: user.id,
      token_jti: identifiers.jti,
      refresh_token_hash: hashToken(identifiers.refreshToken),
      expires_at: buildExpiresAt(refreshTokenSeconds),
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  const accessToken = signAccessToken(buildTokenPayload(user, identifiers.jti));

  return {
    access_token: accessToken,
    expires_in: accessTokenSeconds,
    refresh_token: identifiers.refreshToken
  };
};

const register = async ({ full_name, email, password }, context) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw createError(409, 'CONFLICT', 'A user with this email already exists.');
  }

  const plan = await findPlanBySlug('member');
  if (!plan) {
    throw createError(500, 'INTERNAL_ERROR', 'Default plan not found.');
  }

  const userId = await createUser({
    full_name: full_name.trim(),
    email: normalizedEmail,
    password_hash: await hashPassword(password),
    plan_id: plan.id
  });

  if (!userId) {
    throw createError(500, 'INTERNAL_ERROR', 'User creation failed. Please try again.');
  }

  await updateLastLogin(userId);
  const user = await findUserProfileById(userId);

  if (!user) {
    throw createError(500, 'INTERNAL_ERROR', 'User profile could not be loaded after creation.');
  }

  const tokens = await issueSession({ user, ...context });

  return {
    user: toAuthUser(user),
    tokens
  };
};

const login = async ({ email, password }, context) => {
  const normalizedEmail = email.trim().toLowerCase();
  const userRecord = await findUserByEmail(normalizedEmail);

  if (!userRecord) {
    throw createError(401, 'UNAUTHORIZED', 'Invalid email or password.');
  }

  const passwordMatches = await comparePassword(password, userRecord.password_hash);
  if (!passwordMatches) {
    throw createError(401, 'UNAUTHORIZED', 'Invalid email or password.');
  }

  const user = await findUserProfileById(userRecord.id);
  if (!user || user.status !== 'active') {
    throw createError(403, 'FORBIDDEN', 'Your account is not active.');
  }

  await updateLastLogin(user.id);
  const freshUser = await findUserProfileById(user.id);
  const tokens = await issueSession({ user: freshUser, ...context });

  return {
    user: toAuthUser(freshUser),
    tokens
  };
};

const refresh = async ({ refresh_token }, context) => {
  const session = await findRefreshSession(hashToken(refresh_token));
  if (!session) {
    throw createError(401, 'UNAUTHORIZED', 'Refresh token is invalid or expired.');
  }

  if (session.status !== 'active') {
    throw createError(403, 'FORBIDDEN', 'Your account is not active.');
  }

  const user = {
    id: session.user_id,
    full_name: session.full_name,
    email: session.email,
    role: session.role,
    status: session.status,
    plan: {
      id: session.plan_id,
      slug: session.plan_slug,
      name: session.plan_name,
      is_premium: Boolean(session.plan_is_premium),
      benefits: JSON.parse(session.plan_benefits_json || '[]'),
      price_cents: session.price_cents,
      billing_cycle: session.billing_cycle
    }
  };

  return issueSession({
    user,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    sessionId: session.id
  });
};

const logout = async ({ jti }) => {
  await revokeSessionByJti(jti);
  return { message: 'Logout successful.' };
};

const getCurrentUser = async (userId) => {
  const user = await findUserProfileById(userId);
  if (!user) {
    throw createError(401, 'UNAUTHORIZED', 'Authentication is required.');
  }

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status,
    plan: user.plan
  };
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCurrentUser
};
