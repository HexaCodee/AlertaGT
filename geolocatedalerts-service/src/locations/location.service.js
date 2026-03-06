import UserLocation from './location.model.js';

// Crear o actualizar ubicación de un usuario
export const saveUserLocation = async ({ userId, latitude, longitude, address = null, fcmToken = null }) => {
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
      ...(fcmToken && { fcmToken }),
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

// Obtener ubicación de un usuario
export const getUserLocation = async (userId) => {
  return UserLocation.findOne({ userId });
};

// Actualizar solo el FCM token
export const updateFCMToken = async ({ userId, fcmToken }) => {
  const location = await UserLocation.findOneAndUpdate(
    { userId },
    { fcmToken },
    { new: true }
  );

  return location;
};

// Obtener todos los FCM tokens de usuarios cercanos
export const getNearbyUsersFCMTokens = async ({ latitude, longitude, maxDistance = 2000 }) => {
  const users = await findUsersNearby({ latitude, longitude, maxDistance });

  return {
    users,
    fcmTokens: users
      .filter(u => u.fcmToken)
      .map(u => ({
        userId: u.userId,
        token: u.fcmToken,
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

// Eliminar ubicación de un usuario
export const deleteUserLocation = async (userId) => {
  const location = await UserLocation.findOneAndDelete({ userId });
  return location;
};
