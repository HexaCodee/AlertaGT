// client-user/src/features/map/hooks/useMap.js
// Lógica del mapa: actualizar mi ubicación, buscar alertas cercanas y compartir ubicación.
//
// NOTA: en el geo-service la actualización de ubicación es POST /locations
// (no PUT), y el toggle de compartir es PUT /locations/toggle-sharing.

import { useState, useCallback } from 'react';
import { geoClient, postsClient } from '../../../shared/api/apiClient.js';

export const useMap = () => {
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Guardar/actualizar mi ubicación actual en el geo-service. expoPushToken es
  // opcional (solo nativo, y solo si el usuario otorgó permiso de notificaciones);
  // así se registra el push token de paso, sin un endpoint separado. searchRadius
  // es el radio de alertas configurado por el usuario (preferences.js): el
  // backend lo usa para decidir a quién notificar, no solo un valor fijo.
  const updateLocation = useCallback(async ({ latitude, longitude, address, expoPushToken, searchRadius } = {}) => {
    setError('');
    try {
      const response = await geoClient.post('/locations', { latitude, longitude, address, expoPushToken, searchRadius });
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar tu ubicación');
      return null;
    }
  }, []);

  // Buscar alertas cercanas a una coordenada.
  const fetchNearbyAlerts = useCallback(async ({ latitude, longitude, maxDistance = 5000 }) => {
    setLoading(true);
    setError('');
    try {
      const response = await postsClient.get('/posts/proximity/search', {
        params: { latitude, longitude, maxDistance },
      });
      const data = response.data.data || response.data;
      const list = Array.isArray(data) ? data : [];
      setNearbyAlerts(list);
      return list;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las alertas cercanas');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Activar/desactivar el compartir ubicación.
  const toggleSharing = useCallback(async () => {
    setError('');
    try {
      const response = await geoClient.put('/locations/toggle-sharing');
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cambiar el compartir ubicación');
      return null;
    }
  }, []);

  return { nearbyAlerts, loading, error, updateLocation, fetchNearbyAlerts, toggleSharing };
};

export default useMap;
