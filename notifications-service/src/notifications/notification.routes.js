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
import { asyncHandler } from '../middlewares/async-handler.js';

const router = Router();

/**
 * @swagger
 * /api/v1/notifications:
 *   post:
 *     summary: Crea una notificación desde otro servicio
 *     tags:
 *       - Notifications
 *     security:
 *       - serviceToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notificación creada correctamente
 */
router.post('/', validateServiceToken, asyncHandler(createNotificationController));

// Todas las rutas siguientes requieren autenticación de usuario
router.use(validateJWT);

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Obtiene todas las notificaciones del usuario autenticado
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 */
router.get('/', asyncHandler(getNotifications));

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   get:
 *     summary: Obtiene una notificación por ID
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificación encontrada
 */
router.get('/:id', asyncHandler(getNotificationById));

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   put:
 *     summary: Marca una notificación como leída
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 */
router.put('/:id/read', asyncHandler(setNotificationAsRead));

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   put:
 *     summary: Marca todas las notificaciones del usuario como leídas
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
 */
router.put('/read-all', asyncHandler(setAllNotificationsAsRead));

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Elimina una notificación por ID
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificación eliminada
 */
router.delete('/:id', asyncHandler(removeNotification));

/**
 * @swagger
 * /api/v1/notifications:
 *   delete:
 *     summary: Elimina todas las notificaciones del usuario autenticado
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones eliminadas
 */
router.delete('/', asyncHandler(removeAllUserNotifications));

export default router;
