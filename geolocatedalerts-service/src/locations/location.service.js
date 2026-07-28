import UserLocation from './location.model.js';

// Crear o actualizar ubicación de un usuario
export const saveUserLocation = async ({ userId, latitude, longitude, address = null, expoPushToken = null, searchRadius = null }) => {
  const location = await UserLocation.findOneAndUpdate(
    { userId },
    {
      userId,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude], // GeoJSON: [lng, lat]
      },
      latitude,
      longitude,
      address,
      ...(expoPushToken && { expoPushToken }),
      ...(searchRadius && { searchRadius }),
      lastLocationUpdate: new Date(),
      isActive: true,
    },
    { upsert: true, new: true }
  );

  return location;
};

// Obtener usuarios dentro de un rango de distancia
export const findUsersNearby = async ({ latitude, longitude, maxDistance = 2000, limit = 100 }) => {
  const users = await UserLocation.find({
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance, // en metros
      },
    },
    isActive: true,
  })
    .limit(limit)
    .sort({ lastLocationUpdate: -1 });

  return users;
};

// Techo de búsqueda: ningún usuario puede configurar un radio de alertas mayor
// a este valor (debe cubrir ALERT_RADIUS_MAX en client-user/preferences.js).
const MAX_POSSIBLE_SEARCH_RADIUS = 50000;
const DEFAULT_SEARCH_RADIUS = 2000;

// Usuarios cercanos a un punto, respetando el radio de alertas que cada quien
// configuró en su perfil (no un radio fijo para todos). Se buscan candidatos
// dentro del techo máximo posible y luego se filtra cada uno contra su propio
// searchRadius, comparando con la distancia real calculada por $geoNear.
export const findUsersNearbyWithinOwnRadius = async ({ latitude, longitude, limit = 100 }) => {
  const candidates = await UserLocation.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [longitude, latitude] },
        distanceField: 'distance',
        maxDistance: MAX_POSSIBLE_SEARCH_RADIUS,
        spherical: true,
        query: { isActive: true },
      },
    },
    { $sort: { distance: 1 } },
    { $limit: limit },
  ]);

  return candidates.filter((user) => user.distance <= (user.searchRadius || DEFAULT_SEARCH_RADIUS));
};

// Obtener ubicación de un usuario
export const getUserLocation = async (userId) => {
  return UserLocation.findOne({ userId });
};

// Actualizar solo el push token de Expo
export const updateExpoPushToken = async ({ userId, expoPushToken }) => {
  const location = await UserLocation.findOneAndUpdate(
    { userId },
    { expoPushToken },
    { new: true }
  );

  return location;
};

// Obtener todos los push tokens de Expo de usuarios cercanos
export const getNearbyUsersPushTokens = async ({ latitude, longitude, maxDistance = 2000 }) => {
  const users = await findUsersNearby({ latitude, longitude, maxDistance });

  return {
    users,
    pushTokens: users
      .filter(u => u.expoPushToken)
      .map(u => ({
        userId: u.userId,
        token: u.expoPushToken,
      })),
  };
};

// Marcar usuario como inactivo
export const setUserInactive = async (userId) => {
  const location = await UserLocation.findOneAndUpdate(
    { userId },
    { isActive: false },
    { new: true }
  );

  return location;
};

// Marcar usuario como activo
export const setUserActive = async (userId) => {
  const location = await UserLocation.findOneAndUpdate(
    { userId },
    { isActive: true },
    { new: true }
  );

  return location;
};

// Toggle estado de ubicación (activar/desactivar compartir)
export const toggleLocationSharing = async (userId) => {
  const location = await UserLocation.findOne({ userId });

  if (!location) {
    // Si no existe ubicación, crear una inactiva
    return await UserLocation.create({
      userId,
      location: {
        type: 'Point',
        coordinates: [0, 0], // Coordenadas por defecto
      },
      latitude: 0,
      longitude: 0,
      isActive: false,
      lastLocationUpdate: new Date(),
    });
  }

  // Toggle el estado
  location.isActive = !location.isActive;
  location.lastLocationUpdate = new Date();
  await location.save();

  return location;
};

// Obtener estado de ubicación del usuario
export const getLocationStatus = async (userId) => {
  const location = await UserLocation.findOne({ userId });

  return {
    isActive: location?.isActive ?? false,
    hasLocation: !!location,
    lastUpdate: location?.lastLocationUpdate,
  };
};

// Eliminar ubicación de un usuario
export const deleteUserLocation = async (userId) => {
  const location = await UserLocation.findOneAndDelete({ userId });
  return location;
};
