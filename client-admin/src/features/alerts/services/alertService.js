const POSTS_API_BASE = (import.meta.env.VITE_POSTS_API_URL ?? 'http://localhost:3020/api/v1').replace(/\/+$/, '')

const getToken = () =>
  window.localStorage.getItem('authToken') ||
  window.localStorage.getItem('token') ||
  window.sessionStorage.getItem('token') ||
  ''

const request = async (path, { method = 'GET', body, auth = false } = {}) => {
  const token = auth ? getToken() : ''
  const res = await fetch(`${POSTS_API_BASE}/${String(path).replace(/^\/+/, '')}`, {
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
  if (!res.ok) throw new Error(payload?.message ?? 'Error al conectar con el servidor')
  return payload
}

// Obtener una alerta por su ID
export const getAlertById = (id) =>
  request(`posts/${id}`).then((res) => res?.data ?? res)

// Listar comentarios de una alerta
export const getComments = (postId) =>
  request(`comments/post/${postId}`).then((res) => res?.data ?? [])

// Publicar un comentario (requiere sesión)
export const postComment = (postId, text) =>
  request('comments', { method: 'POST', body: { postId, text }, auth: true }).then((res) => res?.data ?? res)

// Reportar una alerta
export const flagAlert = (postId) =>
  request(`posts/${postId}/flag`, { method: 'POST', auth: true })

// Eliminar una alerta (solo autor)
export const deleteAlert = (postId) =>
  request(`posts/${postId}`, { method: 'DELETE', auth: true })
