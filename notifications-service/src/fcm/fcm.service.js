import admin from '../../configs/firebase.configuration.js';

// Enviar notificación push via FCM
export const sendPushNotification = async ({ token, title, body, data = {} }) => {
  try {
    if (!admin.apps.length) {
      console.warn('⚠ Firebase no está inicializado. Notificación no enviada.');
      return null;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data,
      token,
    };

    const response = await admin.messaging().send(message);
    console.log('✓ Notificación enviada con messageId:', response);
    return response;
  } catch (err) {
    console.error('✗ Error enviando notificación FCM:', err.message);
    throw err;
  }
};

// Enviar notificación a múltiples dispositivos
export const sendMulticastNotification = async ({ tokens, title, body, data = {} }) => {
  try {
    if (!admin.apps.length) {
      console.warn('⚠ Firebase no está inicializado. Notificaciones no enviadas.');
      return null;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data,
    };

    const response = await admin.messaging().sendMulticast({
      ...message,
      tokens,
    });

    console.log('✓ Notificaciones multicast enviadas:', response.successCount, '/', tokens.length);
    return response;
  } catch (err) {
    console.error('✗ Error enviando notificaciones multicast:', err.message);
    throw err;
  }
};

// Suscribir tokens a un tópico
export const subscribeToTopic = async ({ tokens, topic }) => {
  try {
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    console.log('✓ Suscrito al tópico:', topic);
    return response;
  } catch (err) {
    console.error('✗ Error suscribiendo al tópico:', err.message);
    throw err;
  }
};

// Desuscribir tokens de un tópico
export const unsubscribeFromTopic = async ({ tokens, topic }) => {
  try {
    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
    console.log('✓ Desuscrito del tópico:', topic);
    return response;
  } catch (err) {
    console.error('✗ Error desuscribiendo del tópico:', err.message);
    throw err;
  }
};
