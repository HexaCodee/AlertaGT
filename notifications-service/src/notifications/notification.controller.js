import {
  fetchUserNotifications,
  fetchNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllUserNotifications,
  createNotification,
} from './notification.service.js';

// Obtener notificaciones del usuario autenticado
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unread = false } = req.query;
    const userId = req.user.id;

    const { notifications, pagination } = await fetchUserNotifications({
      userId,
      page,
      limit,
      onlyUnread: unread === 'true',
    });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: err.message,
    });
  }
};

// Obtener una notificación por ID
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await fetchNotificationById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la notificación',
      error: err.message,
    });
  }
};

// Marcar una notificación como leída
export const setNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await markAsRead(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notificación marcada como leída',
      data: notification,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al marcar como leída',
      error: err.message,
    });
  }
};

// Marcar todas las notificaciones como leídas
export const setAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al marcar como leídas',
      error: err.message,
    });
  }
};

// Eliminar una notificación
export const removeNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await deleteNotification(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notificación eliminada',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la notificación',
      error: err.message,
    });
  }
};

// Eliminar todas las notificaciones del usuario
export const removeAllUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await deleteAllUserNotifications(userId);

    res.status(200).json({
      success: true,
      message: 'Todas las notificaciones eliminadas',
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar notificaciones',
      error: err.message,
    });
  }
};

// Crear notificación (llamada interna por otros servicios)
export const createNotificationController = async (req, res) => {
  try {
    const { userId, postId, type, title, body, data = {}, fcmToken = null } = req.body;
    if (!userId || !postId || !title || !body) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }

    const notification = await createNotification({ userId, postId, type, title, body, data, fcmToken });

    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creando notificación', error: err.message });
  }
};
