import { auth } from './auth.js';

export const requireAuth = () => {
  if (!auth.isAuthenticated()) {
    window.location.replace('/login.html');
    return false;
  }

  return true;
};

export const redirectIfAuthenticated = () => {
  if (auth.isAuthenticated()) {
    window.location.replace('/index.html');
    return true;
  }

  return false;
};

export const requireAdmin = async () => {
  if (!auth.isAuthenticated()) {
    window.location.replace('/login.html');
    return false;
  }

  const user = await auth.ensureCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.replace('/index.html');
    return false;
  }

  return true;
};
