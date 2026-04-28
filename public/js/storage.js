const keys = {
  accessToken: 'lions_access_token',
  refreshToken: 'lions_refresh_token',
  user: 'lions_user'
};

const readJson = (key) => {
  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
};

export const storage = {
  getAccessToken() {
    return window.localStorage.getItem(keys.accessToken);
  },
  getRefreshToken() {
    return window.localStorage.getItem(keys.refreshToken);
  },
  getUser() {
    return readJson(keys.user);
  },
  setSession(session) {
    if (!session) return;
    const user = session.user;
    const tokens = session.tokens;
    if (tokens?.access_token) {
      window.localStorage.setItem(keys.accessToken, tokens.access_token);
    }

    if (tokens?.refresh_token) {
      window.localStorage.setItem(keys.refreshToken, tokens.refresh_token);
    }

    if (user) {
      window.localStorage.setItem(keys.user, JSON.stringify(user));
    }
  },
  setUser(user) {
    window.localStorage.setItem(keys.user, JSON.stringify(user));
  },
  clearSession() {
    Object.values(keys).forEach((key) => window.localStorage.removeItem(key));
  }
};