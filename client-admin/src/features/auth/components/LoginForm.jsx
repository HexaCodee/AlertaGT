import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../../shared/apis/auth.js'

export const LoginForm = ({ onForgot }) => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ emailOrUsername: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.emailOrUsername.trim() || !form.password.trim()) {
      setError('Por favor completa todos los campos')
      return
    }

    if (form.emailOrUsername.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.emailOrUsername.trim())) {
        setError('Ingresa un correo válido o un nombre de usuario')
        return
      }
    }

    setLoading(true)
    try {
      const response = await login({
        emailOrUsername: form.emailOrUsername.trim(),
        password: form.password
      })

      const token = response?.token || response?.accessToken

      if (!token) {
        setError('Inicio de sesión sin token válido')
        return
      }

      window.localStorage.setItem('authToken', token)
      window.localStorage.setItem('token', token)

      if (response?.userDetails) {
        window.localStorage.setItem('authUser', JSON.stringify(response.userDetails))
      }

      navigate('/home')
    } catch (apiError) {
      setError(apiError.message || 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className='auth-form' onSubmit={handleSubmit} autoComplete='off'>
      {error && <p className='form-error'>{error}</p>}

      <label className='field-group'>
        <span className='field-label'>Correo o usuario</span>
        <div className='input-wrapper'>
          <svg viewBox='0 0 24 24' aria-hidden='true' className='input-icon'>
            <path d='M2.01 6.62 12 13.13l9.99-6.51A2 2 0 0 0 20 4H4a2 2 0 0 0-1.99 2.62z' />
            <path d='M22 8.24 12.7 14.77a3 3 0 0 1-3.4 0L2 8.24V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.24z' />
          </svg>
          <input
            type='text'
            name='emailOrUsername'
            autoComplete='off'
            value={form.emailOrUsername}
            onChange={handleChange}
            placeholder='correo@ejemplo.com o usuario'
          />
        </div>
      </label>

      <label className='field-group'>
        <span className='field-label'>Contraseña</span>
        <div className='input-wrapper password-wrapper'>
          <svg viewBox='0 0 24 24' aria-hidden='true' className='input-icon'>
            <path d='M12 17a1 1 0 0 0 1-1v-1a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1z' />
            <path d='M17 8h-1V7a4 4 0 0 0-8 0v1H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-6-1a2 2 0 0 1 4 0v1h-4V7z' />
          </svg>
          <input
            type={showPassword ? 'text' : 'password'}
            name='password'
            autoComplete='new-password'
            value={form.password}
            onChange={handleChange}
            placeholder='••••••••'
          />
          <button
            type='button'
            className='password-toggle'
            aria-label='Mostrar contraseña'
            onClick={() => setShowPassword((prev) => !prev)}
          >
            <svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z' />
              <circle cx='12' cy='12' r='3' />
            </svg>
          </button>
        </div>
      </label>

      <button type='submit' className='primary-button' disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar sesión'}
      </button>

      <button type='button' className='link-button forgot-link' onClick={onForgot}>
        ¿Olvidaste tu contraseña?
      </button>

      <div className='form-divider' aria-hidden='true' />

      <p className='muted-text'>¿No tienes cuenta?</p>

      <button type='button' className='create-account-button' onClick={() => navigate('/register')}>
        Crear cuenta nueva
      </button>
    </form>
  )
}

