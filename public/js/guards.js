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