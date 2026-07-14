// Utilidades de sesión: token y datos del usuario actual desde el JWT.

export const getToken = () =>
  window.localStorage.getItem('authToken') ||
  window.localStorage.getItem('token') ||
  window.sessionStorage.getItem('token') ||
  ''

// Decodifica el payload del JWT y devuelve el id del usuario actual (claim sub).
export const getCurrentUserId = () => {
  const token = getToken()
  if (!token) return null
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(
      decodeURIComponent(
        window.atob(base64).split('').map((c) =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      )
    )
    return payload.sub || payload.id || payload.userId || null
  } catch {
    return null
  }
}
