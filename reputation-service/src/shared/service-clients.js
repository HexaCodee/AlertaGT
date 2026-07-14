import axios from 'axios';

const POSTS_SERVICE_URL = process.env.POSTS_SERVICE_URL || 'http://localhost:3020/api/v1';
const NOTIFICATIONS_SERVICE_URL = process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3021/api/v1';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

/**
 * Obtiene una alerta desde posts-service. Devuelve null si no existe o si el
 * servicio no está disponible (el llamador decide cómo manejarlo).
 */
export const getPostById = async (postId) => {
  try {
    const resp = await axios.get(`${POSTS_SERVICE_URL}/posts/${postId}`, { timeout: 5000 });
    return resp.data?.data ?? null;
  } catch (err) {
    console.error(`service-clients.getPostById error (${postId}):`, err.message);
    return null;
  }
};

/**
 * Notificación best-effort. Nunca lanza: si el servicio de notificaciones falla,
 * solo se registra en consola para no bloquear el flujo principal.
 */
export const sendNotification = async ({ userId, postId, type, title, body, data = {} }) => {
  try {
    await axios.post(`${NOTIFICATIONS_SERVICE_URL}/notifications`, {
      userId,
      postId,
      type,
      title,
      body,
      data,
    }, {
      headers: { 'x-service-token': SERVICE_TOKEN },
      timeout: 5000,
    });
  } catch (err) {
    console.error('service-clients.sendNotification error:', err.message);
  }
};
