import { Router } from 'express';
import {
  updateUserLocation,
  getUserCurrentLocation,
  getNearbyUsers,
  getNearbyUserTokens,
  updateUserFCMToken,
  markUserInactive,
  markUserActive,
  removeUserLocation,
  toggleLocationSharingController,
  getLocationStatusController,
} from './location.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateServiceToken } from '../../middlewares/validate-service-token.js';
import { asyncHandler } from '../middlewares/async-handler.js';

const router = Router();

/**
 * @swagger
 * /api/v1/locations:
 *   post:
 *     summary: Actualiza la ubicación del usuario
 *     tags:
 *       - Locations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Ubicación actualizada correctamente
 */
router.post('/', asyncHandler(updateUserLocation));

/**
 * @swagger
 * /api/v1/locations/nearby/users:
 *   get:
 *     summary: Obtiene usuarios cercanos
 *     tags:
 *       - Locations
 *     responses:
 *       200:
 *         description: Lista de usuarios cercanos
 */
router.get('/nearby/users', asyncHandler(getNearbyUsers));

/**
 * @swagger
 * /api/v1/locations/nearby/tokens:
 *   get:
 *     summary: Obtiene tokens FCM de usuarios cercanos
 *     tags:
 *       - Locations
 *     security:
 *       - serviceToken: []
 *     responses:
 *       200:
 *         description: Tokens obtenidos correctamente
 */
router.get('/nearby/tokens', validateServiceToken, asyncHandler(getNearbyUserTokens));

// Rutas privadas (requieren autenticación)
router.use(validateJWT);

/**
 * @swagger
 * /api/v1/locations/my-location:
 *   get:
 *     summary: Obtiene la ubicación actual del usuario autenticado
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ubicación del usuario obtenida
 */
router.get('/my-location', asyncHandler(getUserCurrentLocation));

/**
 * @swagger
 * /api/v1/locations/fcm-token:
 *   put:
 *     summary: Actualiza el token FCM del usuario
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token FCM actualizado
 */
router.put('/fcm-token', asyncHandler(updateUserFCMToken));

/**
 * @swagger
 * /api/v1/locations/inactive:
 *   put:
 *     summary: Marca al usuario como inactivo
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario marcado como inactivo
 */
router.put('/inactive', asyncHandler(markUserInactive));

/**
 * @swagger
 * /api/v1/locations/active:
 *   put:
 *     summary: Marca al usuario como activo
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario marcado como activo
 */
router.put('/active', asyncHandler(markUserActive));

/**
 * @swagger
 * /api/v1/locations:
 *   delete:
 *     summary: Elimina la ubicación del usuario autenticado
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ubicación eliminada correctamente
 */
router.delete('/', asyncHandler(removeUserLocation));

/**
 * @swagger
 * /api/v1/locations/toggle-sharing:
 *   put:
 *     summary: Alterna el estado de compartir ubicación
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de compartir ubicación actualizado
 */
router.put('/toggle-sharing', asyncHandler(toggleLocationSharingController));

/**
 * @swagger
 * /api/v1/locations/status:
 *   get:
 *     summary: Obtiene el estado de compartir ubicación
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado obtenido correctamente
 */
router.get('/status', asyncHandler(getLocationStatusController));

export default router;
