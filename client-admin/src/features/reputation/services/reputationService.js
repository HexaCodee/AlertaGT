const REPUTATION_API_BASE = (import.meta.env.VITE_REPUTATION_API_URL ?? 'http://localhost:3023/api/v1').replace(/\/+$/, '')

const getToken = () =>
  window.localStorage.getItem('authToken') ||
  window.localStorage.getItem('token') ||
  window.sessionStorage.getItem('token') ||
  ''

const request = async (path, { method = 'GET', body, auth = false } = {}) => {
  const token = auth ? getToken() : ''
  const res = await fetch(`${REPUTATION_API_BASE}/${String(path).replace(/^\/+/, '')}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let payload = null
  if (text) {
    try { payload = JSON.parse(text) } catch { payload = text }
  }
  if (!res.ok) {
    const message = payload?.message ?? 'Error al conectar con el servidor de reputación'
    const err = new Error(message)
    err.status = res.status
    throw err
  }
  return payload
}

// Motivos de reporte (deben coincidir con REPORT_REASONS del backend)
export const REPORT_REASONS = [
  { value: 'FALSE_INFO', label: 'Información falsa', emoji: '🚫' },
  { value: 'DUPLICATE', label: 'Alerta duplicada', emoji: '📑' },
  { value: 'RESOLVED', label: 'El incidente ya no existe', emoji: '✅' },
  { value: 'SPAM', label: 'Spam o publicidad', emoji: '📢' },
  { value: 'OFFENSIVE', label: 'Contenido ofensivo', emoji: '⚠️' },
  { value: 'OTHER', label: 'Otro motivo', emoji: '❓' },
]

// ── Reportes ──

// Reportar una alerta (requiere sesión)
export const reportAlert = (postId, reason, comment = '') =>
  request('reports', { method: 'POST', body: { postId, reason, comment }, auth: true })

// Veredicto agregado de una alerta (conteo de reportes y estado)
export const getAlertVerdict = (postId) =>
  request(`reports/alert/${postId}`).then((res) => res?.data ?? null)

// ── Calificaciones ──

// Calificar a un usuario (requiere sesión)
export const rateUser = ({ targetUserId, score, comment = '', postId = null }) =>
  request('ratings', { method: 'POST', body: { targetUserId, score, comment, postId }, auth: true })

// Resumen de calificaciones (promedio + distribución) de un usuario
export const getRatingSummary = (userId) =>
  request(`ratings/user/${userId}/summary`).then((res) => res?.data ?? null)

// ── Reputación ──

// Reputación pública de un usuario (confianza, estado, alertas falsas)
export const getReputation = (userId) =>
  request(`reputation/${userId}`).then((res) => res?.data ?? null)
