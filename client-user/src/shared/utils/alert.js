// client-user/src/shared/utils/alert.js
// Alert.alert de react-native-web es un stub vacío (no muestra nada ni llama
// onPress), así que cualquier confirmación o aviso construido solo con Alert.alert
// queda "roto" en web. Estas funciones detectan la plataforma y usan
// window.alert/window.confirm en web, Alert.alert en nativo.

import { Alert, Platform } from 'react-native';

// Aviso simple de una sola acción (equivalente a Alert.alert(title, message)).
// onOk, si se pasa, se ejecuta al cerrar el aviso (tanto en web como en nativo).
export const showAlert = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    onOk?.();
    return;
  }
  Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
};

// Confirmación con dos botones (cancelar / confirmar). Devuelve una función
// onPress-compatible: showConfirm(title, message, onConfirm).
export const showConfirm = (title, message, onConfirm, confirmLabel = 'Confirmar') => {
  if (Platform.OS === 'web') {
    const ok = window.confirm(message ? `${title}\n\n${message}` : title);
    if (ok) onConfirm?.();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
};

export default { showAlert, showConfirm };
