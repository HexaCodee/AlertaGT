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

// Rutas públicas (sin autenticación)
// POST - Actualizar ubicación del usuario
router.post('/', asyncHandler(updateUserLocation));

// GET - Obtener usuarios cercanos
router.get('/nearby/users', asyncHandler(getNearbyUsers));

// GET - Obtener FCM tokens de usuarios cercanos (para enviar notificaciones)
// Esta ruta la llaman otros servicios internamente, validar SERVICE_TOKEN
router.get('/nearby/tokens', validateServiceToken, asyncHandler(getNearbyUserTokens));

// Rutas privadas (requieren autenticación)
router.use(validateJWT);

// GET - Obtener ubicación actual del usuario
router.get('/my-location', asyncHandler(getUserCurrentLocation));

// PUT - Actualizar FCM token
router.put('/fcm-token', asyncHandler(updateUserFCMToken));

// PUT - Marcar como inactivo
router.put('/inactive', asyncHandler(markUserInactive));

// PUT - Marcar como activo
router.put('/active', asyncHandler(markUserActive));

// DELETE - Eliminar ubicación
router.delete('/', asyncHandler(removeUserLocation));

// PUT - Toggle compartir ubicación
router.put('/toggle-sharing', asyncHandler(toggleLocationSharingController));

// GET - Obtener estado de ubicación
router.get('/status', asyncHandler(getLocationStatusController));

export default router;
