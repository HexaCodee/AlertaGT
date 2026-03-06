import { Router } from 'express';
import {
  getNotifications,
  getNotificationById,
  setNotificationAsRead,
  setAllNotificationsAsRead,
  removeNotification,
  removeAllUserNotifications,
  createNotificationController,
} from './notification.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateServiceToken } from '../../middlewares/validate-service-token.js';

const router = Router();

// Endpoint para creación de notificaciones desde otros servicios (protegido por SERVICE_TOKEN)
router.post('/', validateServiceToken, createNotificationController);

// Todas las rutas siguientes requieren autenticación de usuario
router.use(validateJWT);

// GET - Obtener todas las notificaciones del usuario
router.get('/', getNotifications);

// GET - Obtener una notificación por ID
router.get('/:id', getNotificationById);

// PUT - Marcar una notificación como leída
router.put('/:id/read', setNotificationAsRead);

// PUT - Marcar todas como leídas
router.put('/read-all', setAllNotificationsAsRead);

// DELETE - Eliminar una notificación
router.delete('/:id', removeNotification);

// DELETE - Eliminar todas las notificaciones del usuario
router.delete('/', removeAllUserNotifications);

export default router;
