import axios from 'axios';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Enviar notificación push a un dispositivo vía Expo Push API.
// No requiere credenciales: Expo enruta al APNs/FCM subyacente por su cuenta.
export const sendPushNotification = async ({ token, title, body, data = {} }) => {
  try {
    const response = await axios.post(EXPO_PUSH_URL, {
      to: token,
      title,
      body,
      data,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    const ticket = response.data?.data;
    if (ticket?.status === 'error') {
      console.error('✗ Error enviando notificación Expo Push:', ticket.message);
      return ticket;
    }

    console.log('✓ Notificación Expo Push enviada:', ticket?.id);
    return ticket;
  } catch (err) {
    console.error('✗ Error enviando notificación Expo Push:', err.message);
    throw err;
  }
};
