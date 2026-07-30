// Cliente de API del panel de administración.
//
// Agrupa los endpoints protegidos con ADMIN_ROLE/MODERATOR_ROLE, que viven en
// dos microservicios distintos:
//   - reputation-service (3023): reportes, reputación, leaderboard
//   - posts-service      (3020): moderación de alertas
// Todos requieren Bearer token de un usuario con rol de administración.

import { getToken } from '../../../shared/utils/session.js'

const REPUTATION_API_BASE = (import.meta.env.VITE_REPUTATION_API_URL ?? 'http://localhost:3023/api/v1').replace(/\/+$/, '')
const POSTS_API_BASE = (import.meta.env.VITE_POSTS_API_URL ?? 'http://localhost:3020/api/v1').replace(/\/+$/, '')

const request = async (base, path, { method = 'GET', body } = {}) => {
  const token = getToken()
  const res = await fetch(`${base}/${String(path).replace(/^\/+/, '')}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let payload = null
  if (text) {
    try { payload = JSON.parse(text) } catch { payload = text }
  }

  if (!res.ok) {
    const message = res.status === 401 || res.status === 403
      ? 'No tienes permisos de administración para esta acción'
      : (payload?.message ?? 'Error al conectar con el servidor')
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return payload
}

const reputationRequest = (path, options) => request(REPUTATION_API_BASE, path, options)
const postsRequest = (path, options) => request(POSTS_API_BASE, path, options)

// ── Reportes (cola de moderación) ──

export const REPORT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  UPHELD: 'UPHELD',
  DISMISSED: 'DISMISSED',
})

export const REPORT_REASON_LABELS = {
  FALSE_INFO: 'Información falsa',
  DUPLICATE: 'Alerta duplicada',
  RESOLVED: 'El incidente ya no existe',
  SPAM: 'Spam o publicidad',
  OFFENSIVE: 'Contenido ofensivo',
  OTHER: 'Otro motivo',
}

// Listado paginado de reportes. status opcional (PENDING/UPHELD/DISMISSED).
// Devuelve { reports, pagination } tal cual lo entrega el backend.
export const listReports = async ({ status, page = 1, limit = 20 } = {}) => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status) query.set('status', status)
  const res = await reputationRequest(`reports?${query}`)
  return { reports: res?.data ?? [], pagination: res?.pagination ?? null }
}

// Resolver un reporte: UPHELD confirma que la alerta es falsa (penaliza al
// autor), DISMISSED lo desestima.
export const resolveReport = (reportId, decision) =>
  reputationRequest(`reports/${reportId}/resolve`, { method: 'PATCH', body: { decision } })
    .then((res) => res?.data ?? null)

// Veredicto agregado de una alerta (reportsCount, falseReportsCount, verdict).
export const getAlertVerdict = (postId) =>
  reputationRequest(`reports/alert/${postId}`).then((res) => res?.data ?? null)

// ── Reputación de usuarios ──

export const REPUTATION_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  WARNED: 'WARNED',
  SUSPENDED: 'SUSPENDED',
})

// Ranking de usuarios por puntuación de confianza (descendente).
export const getLeaderboard = (limit = 50) =>
  reputationRequest(`reputation/leaderboard/top?limit=${limit}`).then((res) => res?.data ?? [])

// Reputación de un usuario puntual.
export const getReputation = (userId) =>
  reputationRequest(`reputation/${userId}`).then((res) => res?.data ?? null)

// Penalización manual: resta puntos de confianza y puede derivar en aviso o
// suspensión automática según los umbrales del reputation-service.
export const penalizeUser = (userId, { points, reason }) =>
  reputationRequest(`reputation/${userId}/penalize`, { method: 'POST', body: { points, reason } })
    .then((res) => res?.data ?? null)

// Recalcula la reputación desde su historial (útil tras ajustes manuales).
export const recomputeReputation = (userId) =>
  reputationRequest(`reputation/${userId}/recompute`, { method: 'POST' })
    .then((res) => res?.data ?? null)

// ── Moderación de alertas ──

export const MODERATION_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
})

// Listado paginado de alertas activas. Nota: el posts-service solo expone las
// alertas publicadas y no expiradas, así que este listado no incluye histórico.
export const listAlerts = async ({ page = 1, limit = 20, category } = {}) => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (category && category !== 'all') query.set('category', category)
  const res = await postsRequest(`posts?${query}`)
  return { alerts: res?.data ?? [], pagination: res?.pagination ?? null }
}

// Aprobar o rechazar una alerta. Rechazarla la retira de la vista pública.
export const moderateAlert = (postId, { status, comments = '' }) =>
  postsRequest(`posts/${postId}/moderate`, { method: 'PUT', body: { status, comments } })
    .then((res) => res?.data ?? null)

// ── Resumen para el dashboard ──

// Arma los KPIs del panel a partir de los endpoints disponibles. Cada bloque
// falla de forma independiente: si un servicio está caído (o dormido en el
// plan free de Render), el resto del dashboard sigue mostrando datos.
export const getDashboardSummary = async () => {
  const [pending, upheld, dismissed, alerts, leaderboard] = await Promise.allSettled([
    listReports({ status: REPORT_STATUS.PENDING, limit: 1 }),
    listReports({ status: REPORT_STATUS.UPHELD, limit: 1 }),
    listReports({ status: REPORT_STATUS.DISMISSED, limit: 1 }),
    listAlerts({ limit: 1 }),
    getLeaderboard(100),
  ])

  const totalOf = (settled) =>
    settled.status === 'fulfilled' ? (settled.value.pagination?.totalRecords ?? 0) : null

  const users = leaderboard.status === 'fulfilled' ? leaderboard.value : []
  const countByStatus = (status) => users.filter((u) => u.status === status).length

  return {
    reports: {
      pending: totalOf(pending),
      upheld: totalOf(upheld),
      dismissed: totalOf(dismissed),
    },
    alerts: {
      active: totalOf(alerts),
    },
    users: {
      tracked: users.length,
      active: countByStatus(REPUTATION_STATUS.ACTIVE),
      warned: countByStatus(REPUTATION_STATUS.WARNED),
      suspended: countByStatus(REPUTATION_STATUS.SUSPENDED),
      falseAlerts: users.reduce((sum, u) => sum + (u.falseAlertsCount ?? 0), 0),
      averageTrust: users.length
        ? Math.round(users.reduce((sum, u) => sum + (u.trustScore ?? 0), 0) / users.length)
        : null,
    },
    // Se expone para que el dashboard avise qué bloque no se pudo cargar.
    failed: {
      reports: [pending, upheld, dismissed].some((r) => r.status === 'rejected'),
      alerts: alerts.status === 'rejected',
      users: leaderboard.status === 'rejected',
    },
  }
}
