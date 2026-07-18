// client-user/src/features/profile/hooks/useProfile.js
// Lógica de perfil: leer y actualizar el perfil del usuario autenticado.
//
// El perfil vive en el auth-service bajo /Profile (fuera del prefijo /auth).
// Derivamos ese cliente reutilizando la factory createApiClient del apiClient
// compartido, sin modificar shared/.

import { useState, useCallback } from 'react';
import { createApiClient } from '../../../shared/api/apiClient.js';
import { ENDPOINTS } from '../../../shared/constants/endpoints.js';
import { useAuthStore } from '../../../shared/store/authStore.js';

// http://.../api/v1/auth  ->  http://.../api/v1  (raíz del auth-service).
const profileClient = createApiClient(ENDPOINTS.AUTH.replace(/\/auth\/?$/, ''));

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const updateUser = useAuthStore((state) => state.updateUser);

  // Leer el perfil completo del usuario autenticado.
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await profileClient.get('/Profile');
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar tu perfil');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar el perfil (solo campos editables: teléfono, ciudad, dirección, país).
  const updateProfile = useCallback(
    async ({ phone, city, address, country }) => {
      setLoading(true);
      setError('');
      try {
        const response = await profileClient.put('/Profile', {
          Phone: String(phone ?? '').replace(/\D/g, ''),
          City: city ?? '',
          Address: address ?? '',
          Country: country ?? 'Guatemala',
        });
        const updated = response.data.data || response.data;
        updateUser(updated);
        return { success: true, data: updated };
      } catch (err) {
        const message = err.response?.data?.message || 'No se pudo actualizar el perfil';
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [updateUser]
  );

  // Subconjunto público del perfil de cualquier usuario (nombre real para
  // mostrar como autor de alertas/comentarios, igual que en la web).
  const getPublicProfile = useCallback(async (userId) => {
    try {
      const response = await profileClient.get(`/Profile/${userId}/public`);
      return response.data.data || response.data;
    } catch {
      return null;
    }
  }, []);

  return { loading, error, fetchProfile, updateProfile, getPublicProfile };
};

export default useProfile;
