// client-user/src/shared/api/authClient.js
// Cliente axios para el auth-service de AlertaGT.
// Inyecta el Bearer token (cuando existe) y maneja 401, pero NUNCA cierra sesión
// por un 401 en las rutas públicas de autenticación (login/register/verify), donde
// un 401 significa "credenciales inválidas", no "sesión expirada".

import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';

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
  timeout: 15000,
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

// Response: 401 en ruta protegida -> logout; en ruta pública -> dejar pasar el error.
authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !isPublicAuthPath(url)) {
      // TODO(refresh): cuando exista POST /refresh, intentar refrescar aquí antes
      // de cerrar sesión, con cola de peticiones concurrentes.
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default authClient;
