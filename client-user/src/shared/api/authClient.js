// client-user/src/shared/api/authClient.js
// Cliente axios para el auth-service de AlertaGT.
// Inyecta el Bearer token (cuando existe) y maneja 401, pero NUNCA cierra sesión
// por un 401 en las rutas públicas de autenticación (login/register/verify), donde
// un 401 significa "credenciales inválidas", no "sesión expirada".

import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';
import { refreshAccessToken } from './tokenRefresh.js';

// Rutas del auth-service que NO deben disparar logout ante un 401
// (son públicas o previas a tener sesión).
const PUBLIC_AUTH_PATHS = [
  '/login',
  '/register',
  '/verify-email',
  '/resend-verification',
];

const isPublicAuthPath = (url = '') =>
  PUBLIC_AUTH_PATHS.some((path) => url.includes(path));

export const authClient = axios.create({
  baseURL: ENDPOINTS.AUTH,
  timeout: 50000,
  headers: { Accept: 'application/json' },
});

// Request: adjuntar el token si ya hay sesión (p. ej. para cambiar perfil).
authClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: 401 en ruta protegida -> intenta renovar el access token con el
// refresh token y reintenta la petición una sola vez; si el refresh falla,
// cierra sesión. En rutas públicas (login/register/...) un 401 es
// "credenciales inválidas", no "sesión expirada" -> se deja pasar tal cual.
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const url = config?.url || '';

    if (response?.status !== 401 || isPublicAuthPath(url) || config._retry) {
      return Promise.reject(error);
    }

    config._retry = true;
    try {
      const newToken = await refreshAccessToken();
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${newToken}`;
      return authClient(config);
    } catch {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }
  }
);

export default authClient;
