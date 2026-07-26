// client-user/src/shared/api/tokenRefresh.js
// Renovación del access token usando el refresh token guardado en authStore.
// Usa una instancia de axios separada (sin interceptores) para no
// reentrar en la lógica de 401 de authClient/apiClient.

import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';

// Comparte una sola promesa en vuelo: si varias peticiones reciben 401 al
// mismo tiempo, todas esperan el mismo refresh en vez de disparar uno cada una.
let refreshPromise = null;

export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) {
        throw new Error('No hay sesión que renovar');
      }

      const response = await axios.post(
        `${ENDPOINTS.AUTH}/refresh`,
        { refreshToken },
        { timeout: 50000, headers: { Accept: 'application/json' } }
      );

      const data = response.data ?? {};
      if (!data.token) {
        throw new Error('Respuesta de refresh sin token');
      }

      useAuthStore.getState().setToken(data.token, data.refreshToken);
      return data.token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export default refreshAccessToken;
