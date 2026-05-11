import { authRequest } from './api.js'

export const login = async ({ emailOrUsername, password }, options = {}) => {
  return await authRequest('login', {
    method: 'POST',
    body: { emailOrUsername, password },
    signal: options.signal
  })
}
