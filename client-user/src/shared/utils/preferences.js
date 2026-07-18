// client-user/src/shared/utils/preferences.js
// Preferencia local: radio (en metros) dentro del cual el usuario quiere ver
// alertas en el mapa. Equivalente a shared/utils/preferences.js de client-admin
// (que usa localStorage), pero con AsyncStorage — por eso getAlertRadius es async.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'alertagt-alert-radius';

export const ALERT_RADIUS_MIN = 1000; // 1 km
export const ALERT_RADIUS_MAX = 25000; // 25 km
export const ALERT_RADIUS_STEP = 1000; // 1 km
export const ALERT_RADIUS_DEFAULT = 10000; // 10 km

export const getAlertRadius = async () => {
  const raw = await AsyncStorage.getItem(KEY);
  const v = parseInt(raw, 10);
  return Number.isFinite(v) && v > 0 ? v : ALERT_RADIUS_DEFAULT;
};

export const setAlertRadius = async (meters) => {
  await AsyncStorage.setItem(KEY, String(meters));
};

// Formatea metros a texto legible (900 m / 12 km) — igual que en web.
export const formatRadius = (meters) => {
  const m = Number(meters);
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(m % 1000 === 0 ? 0 : 1)} km`;
};

export default { getAlertRadius, setAlertRadius, formatRadius, ALERT_RADIUS_MIN, ALERT_RADIUS_MAX, ALERT_RADIUS_STEP, ALERT_RADIUS_DEFAULT };
