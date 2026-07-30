// Utilidades de sesión: token, usuario actual y rol, leídos del JWT.

export const getToken = () =>
  window.localStorage.getItem('authToken') ||
  window.localStorage.getItem('token') ||
  window.sessionStorage.getItem('token') ||
  ''

// Decodifica el payload del JWT. Devuelve null si no hay token o está malformado.
const decodeTokenPayload = () => {
  const token = getToken()
  if (!token) return null
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(
      decodeURIComponent(
        window.atob(base64).split('').map((c) =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      )
    )
  } catch {
    return null
  }
}

// Id del usuario actual (claim sub).
export const getCurrentUserId = () => {
  const payload = decodeTokenPayload()
  if (!payload) return null
  return payload.sub || payload.id || payload.userId || null
}

// Rol del usuario actual. El auth-service lo emite en el claim "role"
// (ver JwtTokenService.GenerateToken).
export const getCurrentUserRole = () => decodeTokenPayload()?.role ?? null

export const ADMIN_ROLES = ['ADMIN_ROLE', 'MODERATOR_ROLE']

// true si el usuario puede entrar al panel de administración.
export const isAdmin = () => ADMIN_ROLES.includes(getCurrentUserRole())
