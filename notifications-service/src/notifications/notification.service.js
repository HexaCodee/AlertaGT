import Notification from './notification.model.js';
import { sendPushNotification } from '../expo-push/expo-push.service.js';

// Crear notificación (idempotente: no duplica si ya existe el mismo userId+postId+type)
export const createNotification = async ({ userId, postId, type, title, body, data = {}, expoPushToken = null }) => {
  const existing = await Notification.findOne({ userId, postId, type });
  if (existing) return existing;
  // Si es una notificación de alerta cercana, incluir distancia en el título/cuerpo
  let enhancedTitle = title;
  let enhancedBody = body;

  if (type === 'NEARBY_ALERT_CRITICAL' && data.distance) {
    const distance = data.distance < 1000 ? `${data.distance}m` : `${(data.distance / 1000).toFixed(1)}km`;
    enhancedTitle = `🚨 ${title}`;
    enhancedBody = `${body} (a ${distance} de distancia)`;
  }

  const notification = new Notification({
    userId,
    postId,
    type,
    title: enhancedTitle,
    body: enhancedBody,
    data,
  });

  await notification.save();

  // Enviar push vía Expo si el usuario tiene un token registrado
  if (expoPushToken) {
    try {
      const pushResponse = await sendPushNotification({
        token: expoPushToken,
        title: enhancedTitle,
        body: enhancedBody,
        data,
      });
      notification.sentPush = true;
      notification.pushResponse = pushResponse;
      await notification.save();
    } catch (err) {
      console.error('Error enviando notificación push:', err.message);
    }
  }

  return notification;
};

// Distancia en metros entre dos puntos GPS (fórmula de Haversine)
const haversineMeters = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Obtener notificaciones de un usuario
export const fetchUserNotifications = async ({ userId, page = 1, limit = 20, onlyUnread = false, latitude, longitude }) => {
  const filter = { userId };
  if (onlyUnread) filter.read = false;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber);

  // Si el cliente envía su ubicación actual, recalcular la distancia al vuelo
  // en vez de usar la que quedó guardada al momento de crear la notificación
  const hasUserPosition = latitude != null && longitude != null;
  const enrichedNotifications = hasUserPosition
    ? notifications.map((notification) => {
        const { latitude: alertLat, longitude: alertLng } = notification.data ?? {};
        if (alertLat == null || alertLng == null) return notification;

        const distance = Math.round(haversineMeters(latitude, longitude, alertLat, alertLng));
        const obj = notification.toObject();
        obj.data = { ...obj.data, distance };
        return obj;
      })
    : notifications;

  const total = await Notification.countDocuments(filter);

  return {
    notifications: enrichedNotifications,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalRecords: total,
      limit: limitNumber,
    },
  };
};

// Obtener una notificación por ID
export const fetchNotificationById = async (id) => {
  return Notification.findById(id);
};

// Marcar como leída
export const markAsRead = async (id) => {
  const notification = await Notification.findById(id);
  if (!notification) return null;

  notification.read = true;
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

// Marcar todas las notificaciones de un usuario como leídas
export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, read: false },
    { read: true, readAt: new Date() }
  );
  return result;
};

// Eliminar una notificación
export const deleteNotification = async (id) => {
  const notification = await Notification.findById(id);
  if (!notification) return null;

  await notification.deleteOne();
  return notification;
};

// Eliminar todas las notificaciones de un usuario
export const deleteAllUserNotifications = async (userId) => {
  const result = await Notification.deleteMany({ userId });
  return result;
};
