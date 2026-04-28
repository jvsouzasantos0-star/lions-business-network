import { storage } from './storage.js';

/**
 * API base URL configuration.
 * - In browser (served by backend): uses relative '/api'
 * - In Capacitor (APK): uses the deployed backend URL
 * 
 * To configure: set window.LIONS_API_BASE before loading, or
 * the app auto-detects Capacitor and uses the production URL.
 */
const detectApiBase = () => {
  // Allow manual override
  if (window.LIONS_API_BASE) return window.LIONS_API_BASE;

  // Detect Capacitor environment (APK)
  const isCapacitor = window.Capacitor?.isNativePlatform?.() ||
    window.location.protocol === 'capacitor:' ||
    window.location.hostname === 'localhost' && window.location.protocol === 'https:';

  if (isCapacitor) {
    // Production backend URL - update this after deploying
    return 'https://lions-business-network.onrender.com/api';
  }

  // Browser: relative path (same server)
  return '/api';
};

export const apiBase = detectApiBase();

export class ApiError extends Error {
  constructor(message, status, code, details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const buildHeaders = ({ headers = {}, auth = false, body }) => {
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = storage.getAccessToken();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  return requestHeaders;
};

export const toQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.set(key, value);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

/**
 * Check internet connectivity before critical operations.
 */
export const checkConnection = async () => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new ApiError(
      'Sem conexão com a internet. Conecte-se a uma rede Wi-Fi ou dados móveis e tente novamente.',
      0,
      'NO_CONNECTION'
    );
  }
};

export const request = async (path, options = {}) => {
  const {
    method = 'GET',
    auth = false,
    body,
    headers,
    redirectOn401 = true,
    requireConnection = false
  } = options;

  // Check connectivity for critical operations (login, register)
  if (requireConnection) {
    await checkConnection();
  }

  let response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      method,
      headers: buildHeaders({ headers, auth, body }),
      body: body === undefined || body instanceof FormData ? body : JSON.stringify(body)
    });
  } catch (networkError) {
    // Distinguish between no internet and server down
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new ApiError(
        'Sem conexão com a internet. Conecte-se a uma rede Wi-Fi ou dados móveis e tente novamente.',
        0,
        'NO_CONNECTION'
      );
    }
    throw new ApiError(
      'Não foi possível conectar ao servidor. Tente novamente em instantes.',
      0,
      'NETWORK_ERROR'
    );
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    const error = payload?.error;

    if (response.status === 401 && redirectOn401) {
      storage.clearSession();

      if (!window.location.pathname.endsWith('/login.html') && !window.location.pathname.endsWith('/cadastro.html')) {
        window.location.replace('/login.html');
      }
    }

    throw new ApiError(
      error?.message || 'Ocorreu um erro ao comunicar com a plataforma.',
      response.status,
      error?.code || 'UNKNOWN_ERROR',
      error?.details || []
    );
  }

  if (!payload) {
    throw new ApiError(
      'O servidor retornou uma resposta vazia.',
      response.status,
      'EMPTY_RESPONSE'
    );
  }

  return payload?.data ?? payload;
};