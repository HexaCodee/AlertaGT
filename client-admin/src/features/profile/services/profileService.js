import { apiRequest } from '../../../shared/apis/api.js'

/**
 * Obtiene los datos completos del perfil del usuario autenticado
 * (información personal + estadísticas de actividad).
 *
 * @returns {Promise<{ profile: object, stats: object }>}
 */
export const getProfileData = async () => {
  const [profile, stats] = await Promise.all([
    apiRequest('Profile'),
    apiRequest('Profile/stats')
  ])

  return { profile, stats }
}