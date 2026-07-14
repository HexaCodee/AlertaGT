import { apiRequest } from '../../../shared/apis/api.js'

export const getProfileData = async () => {
  const [profile, stats] = await Promise.all([
    apiRequest('Profile'),              // GET /api/v1/Profile
    apiRequest('Profile/stats')         // GET /api/v1/Profile/stats
  ])

  return { profile, stats }
}

export const updateProfile = async (updateDto) => {
  return await apiRequest('Profile', {
    method: 'PUT',
    body: updateDto
  })
}

export const updatePreferences = async (preferencesDto) => {
  return await apiRequest('Profile/preferences', {
    method: 'PUT',
    body: preferencesDto
  })
}

// Subconjunto público del perfil de cualquier usuario (username, nombre, foto).
// Se usa para mostrar el autor real de una alerta/comentario en vez de un genérico.
export const getPublicProfile = async (userId) => {
  return await apiRequest(`Profile/${userId}/public`)
}