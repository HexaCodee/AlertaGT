// client-user/src/features/reports/hooks/useReports.js
// Lógica de reputación y reportes: mis reportes, veredicto de una alerta,
// reputación de un usuario, reportar una alerta y calificar a un autor.

import { useState, useCallback } from 'react';
import { reputationClient } from '../../../shared/api/apiClient.js';

export const useReports = () => {
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mis reportes emitidos.
  const fetchMyReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await reputationClient.get('/reports/mine');
      const data = response.data.data || response.data;
      setMyReports(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar tus reportes');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Veredicto agregado de una alerta (reportsCount, falseReportsCount, verdict).
  const fetchAlertVerdict = useCallback(async (postId) => {
    setError('');
    try {
      const response = await reputationClient.get(`/reports/alert/${postId}`);
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar el veredicto');
      return null;
    }
  }, []);

  // Reputación de un usuario (trustScore, estado ACTIVE/WARNED/SUSPENDED, estrellas).
  const fetchReputation = useCallback(async (userId) => {
    setError('');
    try {
      const response = await reputationClient.get(`/reputation/${userId}`);
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la reputación');
      return null;
    }
  }, []);

  // Reportar una alerta.
  const reportAlert = useCallback(async ({ postId, reason, comment = '' }) => {
    setLoading(true);
    setError('');
    try {
      const response = await reputationClient.post('/reports', { postId, reason, comment });
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo enviar el reporte';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Calificar al autor de una alerta (estrellas 1-5).
  const rateUser = useCallback(async ({ targetUserId, score, postId = null }) => {
    setError('');
    try {
      const response = await reputationClient.post('/ratings', { targetUserId, score, postId });
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo registrar la calificación';
      setError(message);
      return { success: false, message };
    }
  }, []);

  return {
    myReports,
    loading,
    error,
    fetchMyReports,
    fetchAlertVerdict,
    fetchReputation,
    reportAlert,
    rateUser,
  };
};

export default useReports;
