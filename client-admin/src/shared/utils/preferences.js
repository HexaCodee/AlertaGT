// Preferencia global: radio (en metros) dentro del cual el usuario quiere ver alertas.
// Se aplica en Home, Mapa y Notificaciones.

const KEY = 'alertRadius'

export const ALERT_RADIUS_MIN = 1000     // 1 km
export const ALERT_RADIUS_MAX = 25000    // 25 km
export const ALERT_RADIUS_STEP = 1000    // 1 km
export const ALERT_RADIUS_DEFAULT = 10000 // 10 km

export const getAlertRadius = () => {
  const v = parseInt(window.localStorage.getItem(KEY), 10)
  return Number.isFinite(v) && v > 0 ? v : ALERT_RADIUS_DEFAULT
}

export const setAlertRadius = (meters) => {
  window.localStorage.setItem(KEY, String(meters))
  // Aviso opcional para que otras vistas abiertas puedan reaccionar
  window.dispatchEvent(new CustomEvent('alertRadiusChange', { detail: meters }))
}

// Formatea metros a texto legible (900 m / 12 km)
export const formatRadius = (meters) => {
  const m = Number(meters)
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(m % 1000 === 0 ? 0 : 1)} km`
}
