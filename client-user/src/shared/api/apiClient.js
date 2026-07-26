// client-user/src/shared/api/apiClient.js
// Factory de clientes axios para los microservicios de AlertaGT.
// Cada cliente inyecta el Bearer token desde authStore y, ante un 401,
// cierra sesión (el backend aún no soporta refresh token).

import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';

/**
 * Crea una instancia de axios con:
 *  - Authorization: Bearer <token> en cada request (si hay sesión).
 *  - Manejo de 401: logout directo del store.
 *
 * TODO(refresh): cuando el auth-service exponga POST /refresh, aquí es donde va
 * la cola de peticiones concurrentes: al recibir 401, intentar refrescar el
 * token una sola vez, reintentar las peticiones en espera y solo hacer logout()
 * si el refresh falla.
 */
export const createApiClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 50000,
    headers: { Accept: 'application/json' },
  });

  // Request: adjuntar el token de sesión.
  client.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response: si el token es inválido/expiró, cerrar sesión.
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // TODO(refresh): reemplazar por intento de refresh + cola de reintentos.
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Clientes por microservicio, reutilizando la misma factory.
export const postsClient = createApiClient(ENDPOINTS.POSTS);
export const notificationsClient = createApiClient(ENDPOINTS.NOTIFICATIONS);
export const geoClient = createApiClient(ENDPOINTS.GEO);
export const reputationClient = createApiClient(ENDPOINTS.REPUTATION);

export default { createApiClient, postsClient, notificationsClient, geoClient, reputationClient };
