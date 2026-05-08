import { useState } from 'react'
import { LoginForm } from '../components/LoginForm.jsx'
import { ForgotPassword } from '../components/ForgotPassword.jsx'
import alertaIcon from '../../../assets/img/AlertaIcono.png'

export const AuthPage = () => {
  const [mode, setMode] = useState('login')

  const handleBackToLogin = () => setMode('login')

  return (
    <main className='auth-shell'>
      <section className='auth-card'>
        {mode === 'forgot' && (
          <button
            onClick={handleBackToLogin}
            className='auth-back-button'
          >
            <svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' strokeWidth='2.5'>
              <path d='M19 12H5M12 19l-7-7 7-7' />
            </svg>
            <span>Volver</span>
          </button>
        )}
        <div className='auth-top'>
          <div className='auth-icon'>
            <img src={alertaIcon} alt='AlertaGT Icon' />
          </div>
          <h1>{mode === 'forgot' ? 'Recuperar contraseña' : 'Bienvenido a AlertaGT'}</h1>
          <p>{mode === 'forgot' ? 'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña' : 'Inicia sesión para mantenerte seguro'}</p>
        </div>

        {mode === 'login' ? (
          <LoginForm onForgot={() => setMode('forgot')} />
        ) : (
          <ForgotPassword />
        )}
      </section>
    </main>
  )
}
