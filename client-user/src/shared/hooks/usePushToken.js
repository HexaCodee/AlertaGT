// client-user/src/shared/hooks/usePushToken.js
// Obtiene el push token de Expo del dispositivo (solo nativo: iOS/Android).
// Requiere permiso de notificaciones; si se deniega o corre en web, no hay token
// y el resto de la app sigue funcionando con normalidad (push es best-effort).

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { geoClient } from '../api/apiClient.js';

// Android requiere un canal de notificaciones explícito (API 26+); sin esto
// algunos dispositivos descartan las notificaciones push silenciosamente
// aunque el token y el envío sean correctos.
const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Alertas AlertaGT',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
};

export const usePushToken = () => {
  const [pushToken, setPushToken] = useState(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let cancelled = false;

    (async () => {
      try {
        await ensureAndroidChannel();

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted' || cancelled) return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const { data } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
        if (cancelled) return;
        setPushToken(data);

        // Registrar el token de inmediato en el backend, sin depender de que
        // el usuario visite la pantalla de Mapa (antes solo se enviaba de
        // paso junto con las actualizaciones de ubicación).
        try {
          await geoClient.put('/locations/fcm-token', { expoPushToken: data });
        } catch {
          // Se reintentará más adelante vía las actualizaciones de ubicación.
        }
      } catch {
        // Sin push token, la app sigue funcionando con normalidad.
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return pushToken;
};

export default usePushToken;
