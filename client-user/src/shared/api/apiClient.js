// client-user/src/shared/api/apiClient.js
// Factory de clientes axios para los microservicios de AlertaGT.
// Cada cliente inyecta el Bearer token desde authStore y, ante un 401,
// intenta renovar el access token con el refresh token guardado y reintenta
// la petición una vez; si el refresh falla, cierra sesión.

import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';
import { refreshAccessToken } from './tokenRefresh.js';

/**
 * Crea una instancia de axios con:
 *  - Authorization: Bearer <token> en cada request (si hay sesión).
 *  - Manejo de 401: refresh-and-retry, con logout solo si el refresh falla.
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

  // Response: 401 -> intenta renovar el token y reintenta una vez; si el
  // refresh falla (o ya se había reintentado), cierra sesión.
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;

      if (response?.status !== 401 || config._retry) {
        return Promise.reject(error);
      }

      config._retry = true;
      try {
        const newToken = await refreshAccessToken();
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newToken}`;
        return client(config);
      } catch {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
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
