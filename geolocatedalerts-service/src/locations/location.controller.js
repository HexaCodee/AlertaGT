import {
  saveUserLocation,
  findUsersNearby,
  getUserLocation,
  updateFCMToken,
  getNearbyUsersFCMTokens,
  setUserInactive,
  setUserActive,
  deleteUserLocation,
} from './location.service.js';

// Actualizar ubicación del usuario
export const updateUserLocation = async (req, res) => {
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

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userId',
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
    res.status(500).json({
      success: false,
      message: 'Error actualizando ubicación',
      error: err.message,
    });
  }
};

// Obtener ubicación del usuario
export const getUserCurrentLocation = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Error obteniendo ubicación',
      error: err.message,
    });
  }
};

// Obtener usuarios cercanos
export const getNearbyUsers = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 2000, limit = 100 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren latitude y longitude',
      });
    }

    const users = await findUsersNearby({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      maxDistance: parseInt(maxDistance),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
      searchLocation: { latitude, longitude },
      searchRadius: maxDistance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error buscando usuarios cercanos',
      error: err.message,
    });
  }
};

// Obtener FCM tokens de usuarios cercanos
export const getNearbyUserTokens = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Error obteniendo tokens FCM',
      error: err.message,
    });
  }
};

// Actualizar FCM token del usuario
export const updateUserFCMToken = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Error actualizando FCM token',
      error: err.message,
    });
  }
};

// Marcar usuario como inactivo
export const markUserInactive = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Error marcando usuario inactivo',
      error: err.message,
    });
  }
};

// Marcar usuario como activo
export const markUserActive = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Error marcando usuario activo',
      error: err.message,
    });
  }
};

// Eliminar ubicación de usuario
export const removeUserLocation = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Error eliminando ubicación',
      error: err.message,
    });
  }
};
