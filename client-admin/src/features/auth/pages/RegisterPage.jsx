import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../../../shared/apis/auth.js'
import alertaIcon from '../../../assets/img/AlertaIcono.png'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [fields, setFields] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',  // solo validación frontend, NO se envía al backend
    city: 'Guatemala',
    address: '',
    country: 'Guatemala',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validación de campos obligatorios
    if (!fields.name || !fields.surname || !fields.username ||
      !fields.email || !fields.phone || !fields.password || !fields.address) {
      setError('Por favor completa todos los campos obligatorios.')
      return
    }

    // Contraseña mínimo 8 caracteres (según DTO backend)
    if (fields.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    // Confirmación de contraseña
    if (fields.password !== fields.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    // Teléfono: exactamente 8 dígitos (según StringLength(8) del DTO)
    const phoneDigits = fields.phone.replace(/\D/g, '')
    if (phoneDigits.length !== 8) {
      setError('El teléfono debe tener exactamente 8 dígitos.')
      return
    }

    // Construir FormData con los nombres exactos del DTO de .NET
    const formData = new FormData()
    formData.append('Name', fields.name)
    formData.append('Surname', fields.surname)
    formData.append('Username', fields.username)
    formData.append('Email', fields.email)
    formData.append('Password', fields.password)
    formData.append('Phone', phoneDigits)
    formData.append('City', fields.city)
    formData.append('Address', fields.address)
    formData.append('Country', fields.country)
    // confirmPassword NO se agrega, no existe en el DTO
    if (avatarFile) {
      formData.append('ProfilePicture', avatarFile)
    }

    try {
      setLoading(true)
      await register(formData)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='auth-shell'>
      <section className='auth-card register-card'>
        <button type='button' onClick={() => navigate('/')} className='auth-back-button'>
          <svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' strokeWidth='2.5'>
            <path d='M19 12H5M12 19l-7-7 7-7' />
          </svg>
          <span>Volver</span>
        </button>

        <div className='auth-top register-top'>
          <div className='auth-icon'>
            <img src={alertaIcon} alt='AlertaGT Icon' />
          </div>
          <h1>Crear cuenta</h1>
          <p>Únete a la comunidad de AlertaGT</p>
        </div>

        <form className='auth-form register-form' autoComplete='off' onSubmit={handleSubmit}>

          {/* ── Avatar ── */}
          <div className='avatar-uploader'>
            <div className='avatar-circle' aria-hidden='true'>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt='Vista previa'
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <svg viewBox='0 0 24 24'>
                  <path d='M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.14 0-7 1.79-7 4v2h14v-2c0-2.21-2.86-4-7-4z' />
                </svg>
              )}
            </div>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <button
              type='button'
              className='avatar-camera-button'
              aria-label='Subir foto de perfil'
              onClick={() => fileInputRef.current.click()}
            >
              <svg viewBox='0 0 24 24'>
                <path d='M20 5h-3.2l-1.3-1.6a1 1 0 0 0-.8-.4h-5.4a1 1 0 0 0-.8.4L7.2 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-8 11a4 4 0 1 1 4-4 4 4 0 0 1-4 4z' />
              </svg>
            </button>
            <span>Foto de perfil (opcional)</span>
          </div>

          {/* ── Nombre y Apellido ── */}
          <div className='register-grid-2'>
            <label className='field-group'>
              <span className='field-label'>Nombre *</span>
              <input
                type='text'
                name='name'
                className='plain-register-input'
                placeholder='Juan'
                value={fields.name}
                onChange={handleChange}
                maxLength={25}
              />
            </label>

            <label className='field-group'>
              <span className='field-label'>Apellido *</span>
              <input
                type='text'
                name='surname'
                className='plain-register-input'
                placeholder='Pérez'
                value={fields.surname}
                onChange={handleChange}
                maxLength={25}
              />
            </label>
          </div>

          {/* ── Username ── */}
          <label className='field-group'>
            <span className='field-label'>Nombre de usuario *</span>
            <div className='input-wrapper'>
              <svg viewBox='0 0 24 24' aria-hidden='true' className='input-icon'>
                <path d='M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.87 0-7 1.79-7 4v1h14v-1c0-2.21-3.13-4-7-4z' />
              </svg>
              <input
                type='text'
                name='username'
                autoComplete='off'
                placeholder='juanperez'
                value={fields.username}
                onChange={handleChange}
              />
            </div>
          </label>

          {/* ── Email ── */}
          <label className='field-group'>
            <span className='field-label'>Correo electrónico *</span>
            <div className='input-wrapper'>
              <svg viewBox='0 0 24 24' aria-hidden='true' className='input-icon'>
                <path d='M2.01 6.62 12 13.13l9.99-6.51A2 2 0 0 0 20 4H4a2 2 0 0 0-1.99 2.62z' />
                <path d='M22 8.24 12.7 14.77a3 3 0 0 1-3.4 0L2 8.24V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.24z' />
              </svg>
              <input
                type='email'
                name='email'
                placeholder='correo@ejemplo.com'
                value={fields.email}
                onChange={handleChange}
              />
            </div>
          </label>

          {/* ── Teléfono ── */}
          <label className='field-group'>
            <span className='field-label'>Teléfono *</span>
            <div className='input-wrapper'>
              <svg viewBox='0 0 24 24' aria-hidden='true' className='input-icon'>
                <path d='M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.58.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.49a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.58 1 1 0 0 1-.24 1z' />
              </svg>
              <input
                type='tel'
                name='phone'
                placeholder='55551234'
                value={fields.phone}
                onChange={handleChange}
                maxLength={8}
              />
            </div>
          </label>

          {/* ── Dirección ── */}
          <label className='field-group'>
            <span className='field-label'>Dirección *</span>
            <div className='input-wrapper'>
              <svg viewBox='0 0 24 24' aria-hidden='true' className='input-icon'>
                <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' />
              </svg>
              <input
                type='text'
                name='address'
                placeholder='Zona 10, Ciudad de Guatemala'
                value={fields.address}
                onChange={handleChange}
                maxLength={255}
              />
            </div>
          </label>

          {/* ── Contraseña ── */}
          <label className='field-group'>
            <span className='field-label'>Contraseña *</span>
            <div className='input-wrapper password-wrapper'>
              <svg viewBox='0 0 24 24' aria-hidden='true' className='input-icon'>
                <path d='M12 17a1 1 0 0 0 1-1v-1a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1z' />
                <path d='M17 8h-1V7a4 4 0 0 0-8 0v1H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-6-1a2 2 0 0 1 4 0v1h-4V7z' />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                autoComplete='new-password'
                placeholder='Mínimo 8 caracteres'
                value={fields.password}
                onChange={handleChange}
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

          {/* ── Confirmar contraseña ── */}
          <label className='field-group'>
            <span className='field-label'>Confirmar contraseña *</span>
            <div className='input-wrapper password-wrapper'>
              <svg viewBox='0 0 24 24' aria-hidden='true' className='input-icon'>
                <path d='M12 17a1 1 0 0 0 1-1v-1a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1z' />
                <path d='M17 8h-1V7a4 4 0 0 0-8 0v1H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-6-1a2 2 0 0 1 4 0v1h-4V7z' />
              </svg>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name='confirmPassword'
                autoComplete='new-password'
                placeholder='Repite tu contraseña'
                value={fields.confirmPassword}
                onChange={handleChange}
              />
              <button
                type='button'
                className='password-toggle'
                aria-label='Mostrar confirmación de contraseña'
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                <svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' strokeWidth='2'>
                  <path d='M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z' />
                  <circle cx='12' cy='12' r='3' />
                </svg>
              </button>
            </div>
          </label>

          {/* ── Error ── */}
          {error && (
            <p style={{ color: 'red', fontSize: '0.875rem', margin: '0' }}>
              {error}
            </p>
          )}

          <button type='submit' className='primary-button' disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className='register-terms'>
            Al crear una cuenta, aceptas nuestros{' '}
            <Link to='/terms' target='_blank' rel='noopener noreferrer'>Términos de Servicio</Link>
            {' '}y{' '}
            <Link to='/privacy' target='_blank' rel='noopener noreferrer'>Política de Privacidad</Link>
          </p>
        </form>
      </section>
    </main>
  )
}