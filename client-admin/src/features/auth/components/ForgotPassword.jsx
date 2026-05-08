import { useState } from 'react'

export const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!email.trim()) return
    setSent(true)
  }

  return (
    <form className='auth-form' onSubmit={handleSubmit}>
      <label className='field-group'>
        <span className='field-label'>Correo electrónico</span>
        <div className='input-wrapper'>
          <svg viewBox='0 0 24 24' aria-hidden='true' className='input-icon'>
            <path d='M2.01 6.62 12 13.13l9.99-6.51A2 2 0 0 0 20 4H4a2 2 0 0 0-1.99 2.62z' />
            <path d='M22 8.24 12.7 14.77a3 3 0 0 1-3.4 0L2 8.24V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.24z' />
          </svg>
          <input
            type='email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder='correo@ejemplo.com'
            autoComplete='email'
          />
        </div>
      </label>

      <button type='submit' className='primary-button'>
        {sent ? 'Revisa tu correo' : 'Enviar enlace de recuperación'}
      </button>

      <p className='note-box'>
        <strong>Nota:</strong> Si no recibes el correo en unos minutos, revisa tu carpeta de spam o correo no deseado.
      </p>
    </form>
  )
}
