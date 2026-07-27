// client-user/src/features/notifications/hooks/useNotifications.js
// Lógica de notificaciones: historial, marcar leída, eliminar y preferencias.
//
// Las preferencias de notificaciones viven en el auth-service, bajo /Profile
// (fuera del prefijo /auth). Derivamos ese cliente reutilizando la factory
// createApiClient del apiClient compartido, sin modificar shared/.

import { useState, useCallback } from 'react';
import { notificationsClient, createApiClient } from '../../../shared/api/apiClient.js';
import { ENDPOINTS } from '../../../shared/constants/endpoints.js';

// http://.../api/v1/auth  ->  http://.../api/v1  (raíz del auth-service, donde vive /Profile)
const profileClient = createApiClient(ENDPOINTS.AUTH.replace(/\/auth\/?$/, ''));

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Historial de notificaciones del usuario autenticado (userId sale del JWT).
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await notificationsClient.get('/notifications');
      const data = response.data.data || response.data;
      setNotifications(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las notificaciones');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Conteo de no leídas, para el badge del tab bar (no reemplaza el historial completo).
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsClient.get('/notifications', { params: { unread: true, limit: 1 } });
      return response.data.pagination?.totalRecords ?? 0;
    } catch {
      return 0;
    }
  }, []);

  // Marcar una notificación como leída (el backend usa PUT /:id/read).
  const markAsRead = useCallback(async (id) => {
    setError('');
    try {
      await notificationsClient.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo marcar como leída');
      return false;
    }
  }, []);

  // Eliminar una notificación.
  const removeNotification = useCallback(async (id) => {
    setError('');
    try {
      await notificationsClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la notificación');
      return false;
    }
  }, []);

  // Marcar todas como leídas (PUT /notifications/read-all).
  const markAllAsRead = useCallback(async () => {
    setError('');
    try {
      await notificationsClient.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron marcar todas como leídas');
      return false;
    }
  }, []);

  // Eliminar todas mis notificaciones (DELETE /notifications).
  const removeAllNotifications = useCallback(async () => {
    setError('');
    try {
      await notificationsClient.delete('/notifications');
      setNotifications([]);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron eliminar las notificaciones');
      return false;
    }
  }, []);

  // Leer las preferencias actuales del perfil (incluye flags de notificaciones).
  const fetchPreferences = useCallback(async () => {
    setError('');
    try {
      const response = await profileClient.get('/Profile');
      const profile = response.data.data || response.data;
      return profile?.preferences || null;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las preferencias');
      return null;
    }
  }, []);

  // Actualizar las preferencias de notificaciones.
  const updatePreferences = useCallback(async (preferences) => {
    setLoading(true);
    setError('');
    try {
      const response = await profileClient.put('/Profile/preferences', preferences);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudieron guardar las preferencias';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    removeNotification,
    markAllAsRead,
    removeAllNotifications,
    fetchPreferences,
    updatePreferences,
  };
};

export default useNotifications;
