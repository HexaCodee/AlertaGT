// client-user/src/shared/constants/endpoints.js
// URLs base de los microservicios de AlertaGT.
// Sobreescribibles por variables de entorno EXPO_PUBLIC_* (leídas en build por Expo).

import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDevHost = () => {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && window.location?.hostname
      ? window.location.hostname
      : 'localhost';
  }

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.hostUri;
  if (!hostUri) {
    return 'localhost';
  }

  try {
    return new URL(`http://${hostUri}`).hostname;
  } catch {
    return String(hostUri).split(':')[0] || 'localhost';
  }
};

const createLocalServiceUrl = (port, path) => {
  const host = getDevHost();
  return `http://${host}:${port}${path}`;
};

export const ENDPOINTS = {
  AUTH: process.env.EXPO_PUBLIC_AUTH_URL || createLocalServiceUrl(3010, '/api/v1/auth'),
  POSTS: process.env.EXPO_PUBLIC_POSTS_URL || createLocalServiceUrl(3020, '/api/v1'),
  NOTIFICATIONS: process.env.EXPO_PUBLIC_NOTIFICATIONS_URL || createLocalServiceUrl(3021, '/api/v1'),
  GEO: process.env.EXPO_PUBLIC_GEO_URL || createLocalServiceUrl(3022, '/api/v1'),
  REPUTATION: process.env.EXPO_PUBLIC_REPUTATION_URL || createLocalServiceUrl(3023, '/api/v1'),
};

export default ENDPOINTS;
