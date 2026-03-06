import Notification from './notification.model.js';
import { sendPushNotification } from '../fcm/fcm.service.js';

// Crear notificación
export const createNotification = async ({ userId, postId, type, title, body, data = {}, fcmToken = null }) => {
  const notification = new Notification({
    userId,
    postId,
    type,
    title,
    body,
    data,
  });

  await notification.save();

  // Enviar via FCM si el token está disponible
  if (fcmToken) {
    try {
      const fcmResponse = await sendPushNotification({
        token: fcmToken,
        title,
        body,
        data,
      });
      notification.sentViaFCM = true;
      notification.fcmResponse = fcmResponse;
      await notification.save();
    } catch (err) {
      console.error('Error enviando notificación vía FCM:', err.message);
    }
  }

  return notification;
};

// Obtener notificaciones de un usuario
export const fetchUserNotifications = async ({ userId, page = 1, limit = 20, onlyUnread = false }) => {
  const filter = { userId };
  if (onlyUnread) filter.read = false;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber);

  const total = await Notification.countDocuments(filter);

  return {
    notifications,
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
