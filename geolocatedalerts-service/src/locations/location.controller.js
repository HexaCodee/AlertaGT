import axios from 'axios';
import {
  saveUserLocation,
  findUsersNearby,
  getUserLocation,
  updateExpoPushToken,
  getNearbyUsersPushTokens,
  setUserInactive,
  setUserActive,
  toggleLocationSharing,
  getLocationStatus,
  deleteUserLocation,
} from './location.service.js';
import { validateGpsCoordinates, validateSearchRadius, validateExpoPushToken } from '../../middlewares/geo-validators.js';
import { jwtDecode } from 'jwt-decode';

const POSTS_SERVICE_URL = process.env.POSTS_SERVICE_URL || 'http://localhost:3020/api/v1';
const NOTIFICATIONS_SERVICE_URL = process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3021/api/v1';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

async function notifyNearbyAlerts(userId, latitude, longitude, expoPushToken) {
  try {
    const postsResp = await axios.get(`${POSTS_SERVICE_URL}/posts/proximity/search`, {
      params: { latitude, longitude, maxDistance: 2000 },
    });
    const posts = (postsResp.data?.data || []).filter((post) => post.authorId !== userId);
    if (!posts.length) return;

    // Solo notificar sobre alertas creadas en las últimas 24 horas
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentPosts = posts.filter(p => new Date(p.createdAt) > cutoff);
    if (!recentPosts.length) return;

    console.log(`[geo] notifyNearbyAlerts: notifying user ${userId} about ${recentPosts.length} nearby alert(s)`);

    await Promise.all(recentPosts.map(async (post) => {
      const type = post.riskType === 'GRAVE' ? 'NEARBY_ALERT_CRITICAL' : 'NEW_ALERT';
      try {
        await axios.post(`${NOTIFICATIONS_SERVICE_URL}/notifications`, {
          userId,
          postId: post._id,
          type,
          title: post.title,
          body: post.text?.substring(0, 120) || '',
          data: {
            postId: post._id,
            category: post.category,
            riskType: post.riskType,
            distance: Math.round(post.distance || 0),
            latitude: post.location?.latitude,
            longitude: post.location?.longitude,
          },
          expoPushToken: expoPushToken || null,
        }, { headers: { 'x-service-token': SERVICE_TOKEN } });
      } catch (postErr) {
        console.error(`[geo] notifyNearbyAlerts: failed to notify user ${userId} about post ${post._id}:`, postErr.response?.status, postErr.message);
      }
    }));
  } catch (err) {
    console.error('[geo] notifyNearbyAlerts error:', err.response?.status, err.message);
  }
}

const extractUserId = (req) => {
  // Intentar obtenerlo si el middleware JWT ya lo resolvió correctamente
  let userId = req.user?.id || req.userId || req.body.userId || req.params.userId;
  
  // Fallback: Si no viene, lo decodificamos directamente del Header de Authorization
  if (!userId) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = jwtDecode(token);
        userId = payload.sub || payload.id;
      } catch (e) {
        console.error("Error decodificando token en controlador:", e.message);
      }
    }
  }
  return userId;
};

// Actualizar ubicación del usuario
export const updateUserLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, address } = req.body;
    const expoPushToken = req.body.expoPushToken;
    const userId = extractUserId(req);

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

    // Validar push token de Expo si se proporciona
    if (expoPushToken && !validateExpoPushToken(expoPushToken)) {
      return res.status(400).json({
        success: false,
        message: 'Push token de Expo inválido',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const location = await saveUserLocation({
      userId,
      latitude: lat,
      longitude: lng,
      address,
      expoPushToken,
    });

    res.status(200).json({
      success: true,
      message: 'Ubicación actualizada',
      data: location,
    });

    void notifyNearbyAlerts(userId, lat, lng, location.expoPushToken);
  } catch (err) {
    next(err);
  }
};

// Obtener ubicación del usuario
export const getUserCurrentLocation = async (req, res, next) => {
  try {
    const userId = extractUserId(req);

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

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const gpsValidation = validateGpsCoordinates(lat, lng);
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
      latitude: lat,
      longitude: lng,
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

// Obtener push tokens de Expo de usuarios cercanos
export const getNearbyUserTokens = async (req, res, next) => {
  try {
    const { latitude, longitude, maxDistance = 2000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren latitude y longitude',
      });
    }

    const { users, pushTokens } = await getNearbyUsersPushTokens({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      maxDistance: parseInt(maxDistance) || 2000,
    });

    res.status(200).json({
      success: true,
      data: {
        users: users.length,
        tokens: pushTokens,
      },
      searchLocation: { latitude, longitude },
      searchRadius: maxDistance,
    });
  } catch (err) {
    next(err);
  }
};

// Actualizar push token de Expo del usuario
export const updateUserFCMToken = async (req, res, next) => {
  try {
    const { expoPushToken } = req.body;
    const userId = extractUserId(req);

    if (!userId || !expoPushToken) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren userId y expoPushToken',
      });
    }

    const location = await updateExpoPushToken({ userId, expoPushToken });

    res.status(200).json({
      success: true,
      message: 'Push token actualizado',
      data: location,
    });
  } catch (err) {
    next(err);
  }
};

// Marcar usuario como inactivo
export const markUserInactive = async (req, res, next) => {
  try {
    const userId = extractUserId(req);

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
    const userId = extractUserId(req);

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
    const userId = extractUserId(req);

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
    const userId = extractUserId(req);

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
    const userId = extractUserId(req);

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