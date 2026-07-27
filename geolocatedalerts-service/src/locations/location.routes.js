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
import { asyncHandler } from '../middlewares/async-handler.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateServiceToken } from '../../middlewares/validate-service-token.js';

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
 *             $ref: '#/components/schemas/LocationUpdateRequest'
 *     responses:
 *       200:
 *         description: Ubicación actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BooleanStatusResponse'
 *       400:
 *         description: Datos de ubicación inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/', asyncHandler(updateUserLocation));

/**
 * @swagger
 * /api/v1/locations/nearby/users:
 *   get:
 *     summary: Obtiene usuarios cercanos
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxDistance
 *         required: false
 *         schema:
 *           type: number
 *           default: 2000
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Lista de usuarios cercanos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NearbyUsersResponse'
 *       400:
 *         description: Parámetros de búsqueda inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxDistance
 *         required: false
 *         schema:
 *           type: number
 *           default: 2000
 *     responses:
 *       200:
 *         description: Tokens obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NearbyTokensResponse'
 *       400:
 *         description: Parámetros de búsqueda inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Token de servicio inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BooleanStatusResponse'
 *       400:
 *         description: Falta userId o token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Token JWT inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/my-location', asyncHandler(getUserCurrentLocation));

/**
 * @swagger
 * /api/v1/locations/fcm-token:
 *   put:
 *     summary: Actualiza el push token de Expo del usuario
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFcmTokenRequest'
 *     responses:
 *       200:
 *         description: Push token actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BooleanStatusResponse'
 *       400:
 *         description: Faltan campos obligatorios o token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Token JWT inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BooleanStatusResponse'
 *       401:
 *         description: Token JWT inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BooleanStatusResponse'
 *       401:
 *         description: Token JWT inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BooleanStatusResponse'
 *       401:
 *         description: Token JWT inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BooleanStatusResponse'
 *       401:
 *         description: Token JWT inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatusResponse'
 *       401:
 *         description: Token JWT inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/status', asyncHandler(getLocationStatusController));

export default router;