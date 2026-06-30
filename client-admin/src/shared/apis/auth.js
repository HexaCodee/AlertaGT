import { authRequest } from './api.js'

export const login = async ({ emailOrUsername, password }, options = {}) => {
  return await authRequest('login', {
    method: 'POST',
    body: { emailOrUsername, password },
    signal: options.signal,
    isPublic: true
  })
}

export const register = async (formData) => {
  return await authRequest('register', {
    method: 'POST',
    body: formData,
    isFormData: true, // Esta bandera le dice a api.js que no fuerce JSON
    isPublic: true
  })
}