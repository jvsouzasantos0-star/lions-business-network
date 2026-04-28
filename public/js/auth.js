import { request } from './api.js';
import { storage } from './storage.js';

/**
 * Normalizes the API response to always get {user, tokens}.
 * Handles multiple response shapes from the backend.
 */
const extractSession = (resp) => {
  if (!resp) return null;

  // Shape: {user: {...}, tokens: {...}}
  if (resp.user && resp.tokens) return resp;

  // Shape: {data: {user: {...}, tokens: {...}}}
  if (resp.data && resp.data.user && resp.data.tokens) return resp.data;

  return null;
};

export const auth = {
  token() {
    return storage.getAccessToken();
  },
  isAuthenticated() {
    return Boolean(storage.getAccessToken());
  },
  user() {
    return storage.getUser();
  },

  async login(credentials) {
    const resp = await request('/auth/login', {
      method: 'POST',
      body: credentials,
      redirectOn401: false,
      requireConnection: true
    });

    const session = extractSession(resp);
    if (!session || !session.tokens?.access_token) {
      console.error('[Lions Auth] Login unexpected response:', JSON.stringify(resp));
      throw new Error('Erro ao fazer login. Resposta inesperada do servidor.');
    }

    if (!session.user) {
      console.error('[Lions Auth] Login: user is null in response');
      throw new Error('Erro ao fazer login. Usuário não encontrado.');
    }

    storage.setSession(session);
    return session;
  },

  async register(payload) {
    const resp = await request('/auth/register', {
      method: 'POST',
      body: payload,
      redirectOn401: false,
      requireConnection: true
    });

    const session = extractSession(resp);
    if (!session || !session.tokens?.access_token) {
      console.error('[Lions Auth] Register unexpected response:', JSON.stringify(resp));
      throw new Error('Erro no cadastro. Resposta inesperada do servidor.');
    }

    if (!session.user) {
      console.error('[Lions Auth] Register: user is null in response');
      throw new Error('Erro no cadastro. Usuário não foi criado corretamente.');
    }

    // Auto-login after register
    storage.setSession(session);
    return session;
  },

  async fetchCurrentUser() {
    const resp = await request('/auth/me', {
      auth: true
    });

    const user = resp?.user || resp;
    if (user && user.id) {
      storage.setUser(user);
    }
    return user;
  },

  async ensureCurrentUser() {
    const cached = storage.getUser();
    if (cached && cached.id) return cached;
    return this.fetchCurrentUser();
  },

  async logout() {
    const refreshToken = storage.getRefreshToken();

    try {
      await request('/auth/logout', {
        method: 'POST',
        auth: true,
        body: refreshToken ? { refresh_token: refreshToken } : {},
        redirectOn401: false
      });
    } finally {
      storage.clearSession();
    }
  },

  clear() {
    storage.clearSession();
  }
};
