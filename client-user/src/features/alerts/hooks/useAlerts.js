// client-user/src/features/alerts/hooks/useAlerts.js
// Lógica de alertas: feed, detalle (con comentarios), crear y eliminar.

import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { postsClient } from '../../../shared/api/apiClient.js';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Feed de alertas (paginado). page/limit opcionales.
  const fetchAlerts = useCallback(async ({ page = 1, limit = 20, category } = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit };
      if (category) params.category = category;
      const response = await postsClient.get('/posts', { params });
      const data = response.data.data || response.data;
      setAlerts(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las alertas');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Feed de alertas ordenado por cercanía (igual que HomePage en la web):
  // el backend calcula "distance" en metros vía $geoNear y lo devuelve en
  // cada alerta, ya ordenado del más cercano al más lejano.
  const fetchNearbyAlerts = useCallback(async ({ latitude, longitude, maxDistance, category }) => {
    setLoading(true);
    setError('');
    try {
      const params = { latitude, longitude, maxDistance };
      if (category) params.category = category;
      const response = await postsClient.get('/posts/proximity/search', { params });
      const data = response.data.data || response.data;
      const list = Array.isArray(data) ? data : [];
      setAlerts(list);
      return list;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las alertas');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Detalle de una alerta + sus comentarios.
  const fetchAlertDetail = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      const [alertRes, commentsRes] = await Promise.all([
        postsClient.get(`/posts/${id}`),
        postsClient.get(`/comments/post/${id}`).catch(() => ({ data: { data: [] } })),
      ]);
      const alert = alertRes.data.data || alertRes.data;
      const comments = commentsRes.data.data || commentsRes.data || [];
      return { alert, comments: Array.isArray(comments) ? comments : [] };
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la alerta');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Publicar un comentario en una alerta.
  const addComment = useCallback(async (postId, text) => {
    setError('');
    try {
      const response = await postsClient.post('/comments', { postId, text });
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo publicar el comentario');
      return null;
    }
  }, []);

  // Crear una alerta. location es objeto {latitude, longitude, address}; image es {uri,name,type}.
  const createAlert = useCallback(async ({ title, category, riskType, text, location, image }) => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('riskType', riskType);
      formData.append('text', text);
      if (location) formData.append('location', JSON.stringify(location));
      if (image) {
        if (Platform.OS === 'web' && image.file) {
          // En web, FormData necesita un Blob/File real; el objeto {uri,name,type}
          // (idioma nativo de RN) no se serializa como archivo en el navegador.
          formData.append('image', image.file, image.name || 'alerta.jpg');
        } else {
          formData.append('image', {
            uri: image.uri,
            name: image.name || 'alerta.jpg',
            type: image.type || 'image/jpeg',
          });
        }
      }

      // No fijar 'Content-Type' manualmente: tanto el navegador (fetch/XHR web)
      // como el runtime de React Native necesitan generar ellos mismos el
      // boundary del multipart a partir del FormData. Si se fuerza el header
      // aquí, axios lo respeta tal cual (sin boundary) y el servidor no puede
      // parsear las partes -> las imágenes nunca llegan a Cloudinary.
      const response = await postsClient.post('/posts', formData);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo publicar la alerta';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar una alerta (el backend valida que seas el autor).
  const deleteAlert = useCallback(async (id) => {
    setError('');
    try {
      await postsClient.delete(`/posts/${id}`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo eliminar la alerta';
      setError(message);
      return { success: false, message };
    }
  }, []);

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    fetchNearbyAlerts,
    fetchAlertDetail,
    addComment,
    createAlert,
    deleteAlert,
  };
};

export default useAlerts;
