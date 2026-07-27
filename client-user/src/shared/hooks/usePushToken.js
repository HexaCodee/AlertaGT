// client-user/src/shared/hooks/usePushToken.js
// Obtiene el push token de Expo del dispositivo (solo nativo: iOS/Android).
// Requiere permiso de notificaciones; si se deniega o corre en web, no hay token
// y el resto de la app sigue funcionando con normalidad (push es best-effort).

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export const usePushToken = () => {
  const [pushToken, setPushToken] = useState(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let cancelled = false;

    (async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted' || cancelled) return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const { data } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
        if (!cancelled) setPushToken(data);
      } catch {
        // Sin push token, la app sigue funcionando con normalidad.
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return pushToken;
};

export default usePushToken;
