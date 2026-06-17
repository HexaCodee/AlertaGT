const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL ?? 'http://localhost:3010/api/v1/Auth'

const normalizePath = (path) => `${AUTH_BASE_URL.replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`

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

export const authRequest = async (path, { method = 'GET', body, headers, signal } = {}) => {
  const token = window.localStorage.getItem('authToken') || window.localStorage.getItem('token')

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
      : 'Error al conectar con autenticación'

    throw new Error(getErrorMessage(payload, defaultMessage))
  }

  return payload
}
