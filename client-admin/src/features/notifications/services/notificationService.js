import { getAuthToken } from '../../../shared/apis/api.js'

const NOTIFICATIONS_URL =
  (import.meta.env.VITE_NOTIFICATIONS_URL ?? 'http://localhost:3021/api/v1').replace(/\/+$/, '')

const request = async (path, { method = 'GET', body } = {}) => {
  const token = getAuthToken()
  const url = `${NOTIFICATIONS_URL}/${String(path).replace(/^\/+/, '')}`

  const res = await fetch(url, {
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
  if (!res.ok) throw new Error(payload?.message ?? 'Error al conectar con el servidor')
  return payload
}

export const fetchNotifications = ({ unread = false, latitude, longitude } = {}) => {
  const params = new URLSearchParams()
  if (unread) params.set('unread', 'true')
  if (latitude != null && longitude != null) {
    params.set('latitude', latitude)
    params.set('longitude', longitude)
  }
  const query = params.toString()
  return request(`notifications${query ? `?${query}` : ''}`)
}

export const markAsRead = (id) =>
  request(`notifications/${id}/read`, { method: 'PUT' })

export const markAllAsRead = () =>
  request('notifications/read-all', { method: 'PUT' })

export const deleteNotification = (id) =>
  request(`notifications/${id}`, { method: 'DELETE' })

export const deleteAllNotifications = () =>
  request('notifications', { method: 'DELETE' })
