const API_BASE_URL = import.meta.env.VITE_AUTH_URL ?? 'http://localhost:3010/api/v1'

/**
 * Normaliza la URL base eliminando el segmento del controlador si existe.
 * VITE_AUTH_URL puede ser "http://host/api/v1/auth" — extraemos solo "http://host/api/v1".
 */
const getBaseUrl = () => {
  const url = API_BASE_URL.replace(/\/+$/, '')
  // Si la URL ya termina con un segmento de controlador como /auth, /Auth, etc., lo removemos
  // para obtener la base pura: http://localhost:3010/api/v1
  return url.replace(/\/[Aa]uth$/i, '')
}

const BASE_URL = getBaseUrl()

const normalizePath = (path) =>
  `${BASE_URL}/${String(path).replace(/^\/+/, '')}`

const getErrorMessage = (payload, defaultMessage) => {
  if (!payload) return defaultMessage

  if (typeof payload === 'string') return payload

  if (payload.message) return payload.message
  if (payload.detail) return payload.detail
  if (payload.title) return payload.title

  if (payload.errors && typeof payload.errors === 'object') {
    const firstErrorKey = Object.keys(payload.errors)[0]
    const firstError = payload.errors[firstErrorKey]
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0]
    }
  }

  return defaultMessage
}

/**
 * Obtiene el token de autenticación del almacenamiento local.
 * @returns {string|null} El token JWT o null si no existe.
 */
export const getAuthToken = () =>
  window.localStorage.getItem('authToken') || window.localStorage.getItem('token')

/**
 * Realiza una petición HTTP autenticada al API.
 * @param {string} path - Ruta relativa al base URL (ej: "Auth/login", "Profile", "Profile/stats").
 * @param {object} options - Opciones de la petición (method, body, headers, signal).
 * @returns {Promise<any>} La respuesta parseada del servidor.
 */
export const apiRequest = async (path, { method = 'GET', body, headers, signal } = {}) => {
  const token = getAuthToken()

  const response = await fetch(normalizePath(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {})
    },
    body: body ? JSON.stringify(body) : undefined,
    signal
  })

  const text = await response.text()
  let payload = null

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    const defaultMessage = response.status === 401
      ? 'Credenciales inválidas'
      : 'Error al conectar con el servidor'

    throw new Error(getErrorMessage(payload, defaultMessage))
  }

  return payload
}

/**
 * Atajo para peticiones al controlador Auth.
 * @deprecated Usar apiRequest('Auth/...') directamente para mayor claridad.
 */
export const authRequest = (path, options) =>
  apiRequest(`Auth/${path}`, options)
