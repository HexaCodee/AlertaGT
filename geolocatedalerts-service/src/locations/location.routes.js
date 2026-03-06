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
} from './location.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateServiceToken } from '../../middlewares/validate-service-token.js';

const router = Router();

// Rutas públicas (sin autenticación)
// POST - Actualizar ubicación del usuario
router.post('/', updateUserLocation);

// GET - Obtener usuarios cercanos
router.get('/nearby/users', getNearbyUsers);

// GET - Obtener FCM tokens de usuarios cercanos (para enviar notificaciones)
// Esta ruta la llaman otros servicios internamente, validar SERVICE_TOKEN
router.get('/nearby/tokens', validateServiceToken, getNearbyUserTokens);

// Rutas privadas (requieren autenticación)
router.use(validateJWT);

// GET - Obtener ubicación actual del usuario
router.get('/my-location', getUserCurrentLocation);

// PUT - Actualizar FCM token
router.put('/fcm-token', updateUserFCMToken);

// PUT - Marcar como inactivo
router.put('/inactive', markUserInactive);

// PUT - Marcar como activo
router.put('/active', markUserActive);

// DELETE - Eliminar ubicación
router.delete('/', removeUserLocation);

export default router;
