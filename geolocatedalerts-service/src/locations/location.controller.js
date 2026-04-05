import {
  saveUserLocation,
  findUsersNearby,
  getUserLocation,
  updateFCMToken,
  getNearbyUsersFCMTokens,
  setUserInactive,
  setUserActive,
  toggleLocationSharing,
  getLocationStatus,
  deleteUserLocation,
} from './location.service.js';
import { validateGpsCoordinates, validateSearchRadius, validateFCMToken } from '../../middlewares/geo-validators.js';

// Actualizar ubicación del usuario
export const updateUserLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, address } = req.body;
    const userId = req.user?.id || req.body.userId;
    const fcmToken = req.body.fcmToken;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren latitude y longitude',
      });
    }

    // Validar coordenadas GPS
    const gpsValidation = validateGpsCoordinates(latitude, longitude);
    if (!gpsValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: gpsValidation.error,
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userId',
      });
    }

    // Validar FCM token si se proporciona
    if (fcmToken && !validateFCMToken(fcmToken)) {
      return res.status(400).json({
        success: false,
        message: 'Token FCM inválido',
      });
    }

    const location = await saveUserLocation({
      userId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address,
      fcmToken,
    });

    res.status(200).json({
      success: true,
      message: 'Ubicación actualizada',
      data: location,
    });
  } catch (err) {
    next(err);
  }
};

// Obtener ubicación del usuario
export const getUserCurrentLocation = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userId',
      });
    }

    const location = await getUserLocation(userId);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: location,
    });
  } catch (err) {
    next(err);
  }
};

// Obtener usuarios cercanos
export const getNearbyUsers = async (req, res, next) => {
  try {
    const { latitude, longitude, maxDistance = 2000, limit = 100 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren latitude y longitude',
      });
    }

    // Validar coordenadas GPS
    const gpsValidation = validateGpsCoordinates(latitude, longitude);
    if (!gpsValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: gpsValidation.error,
      });
    }

    // Validar radio de búsqueda
    const radiusValidation = validateSearchRadius(maxDistance);
    const finalRadius = radiusValidation.normalizedRadius;

    const users = await findUsersNearby({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      maxDistance: finalRadius,
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
      searchLocation: { latitude, longitude },
      searchRadius: finalRadius,
    });
  } catch (err) {
    next(err);
  }
};

// Obtener FCM tokens de usuarios cercanos
export const getNearbyUserTokens = async (req, res, next) => {
  try {
    const { latitude, longitude, maxDistance = 2000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren latitude y longitude',
      });
    }

    const { users, fcmTokens } = await getNearbyUsersFCMTokens({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      maxDistance: parseInt(maxDistance),
    });

    res.status(200).json({
      success: true,
      data: {
        users: users.length,
        tokens: fcmTokens,
      },
      searchLocation: { latitude, longitude },
      searchRadius: maxDistance,
    });
  } catch (err) {
    next(err);
  }
};

// Actualizar FCM token del usuario
export const updateUserFCMToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId || !fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren userId y fcmToken',
      });
    }

    const location = await updateFCMToken({ userId, fcmToken });

    res.status(200).json({
      success: true,
      message: 'FCM token actualizado',
      data: location,
    });
  } catch (err) {
    next(err);
  }
};

// Marcar usuario como inactivo
export const markUserInactive = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userId',
      });
    }

    const location = await setUserInactive(userId);

    res.status(200).json({
      success: true,
      message: 'Usuario marcado como inactivo',
      data: location,
    });
  } catch (err) {
    next(err);
  }
};

// Marcar usuario como activo
export const markUserActive = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userId',
      });
    }

    const location = await setUserActive(userId);

    res.status(200).json({
      success: true,
      message: 'Usuario marcado como activo',
      data: location,
    });
  } catch (err) {
    next(err);
  }
};

// Eliminar ubicación de usuario
export const removeUserLocation = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userId',
      });
    }

    const location = await deleteUserLocation(userId);

    res.status(200).json({
      success: true,
      message: 'Ubicación eliminada',
    });
  } catch (err) {
    next(err);
  }
};

// Toggle compartir ubicación
export const toggleLocationSharingController = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userId',
      });
    }

    const location = await toggleLocationSharing(userId);

    res.status(200).json({
      success: true,
      message: `Compartir ubicación ${location.isActive ? 'activado' : 'desactivado'}`,
      data: {
        isActive: location.isActive,
        lastUpdate: location.lastLocationUpdate,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Obtener estado de ubicación
export const getLocationStatusController = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userId',
      });
    }

    const status = await getLocationStatus(userId);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (err) {
    next(err);
  }
};
