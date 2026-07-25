import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { verifyEmail } from '../../../shared/apis/auth.js'
import alertaIcon from '../../../assets/img/AlertaIcono.png'

// Pantalla a la que llega el usuario al hacer clic en el link del correo de
// verificación (EmailService.SendEmailVerificationAsync manda a
// {FrontendUrl}/verify-email?token=...). Antes esta ruta no existía en
// AppRoutes, así que el link nunca verificaba nada — el usuario caía en una
// página en blanco/404 y su cuenta se quedaba sin activar.
export const VerifyEmailPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  // loading | success | error — si no hay token, arrancamos directo en error
  // (sin necesidad de setState dentro del efecto para ese caso).
  const [status, setStatus] = useState(token ? 'loading' : 'error')
  const [message, setMessage] = useState(token ? '' : 'El enlace de verificación no es válido: falta el token.')
  const requestedRef = useRef(false)

  useEffect(() => {
    if (!token || requestedRef.current) return
    requestedRef.current = true

    verifyEmail(token)
      .then(() => {
        setStatus('success')
        setMessage('Tu cuenta fue verificada correctamente. Ya podés iniciar sesión.')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || 'No se pudo verificar tu correo. El enlace puede haber expirado.')
      })
  }, [token])

  return (
    <main className='auth-shell'>
      <section className='auth-card'>
        <div className='auth-top'>
          <div className='auth-icon'>
            {status === 'loading' ? (
              <span className='verify-spinner' aria-hidden='true' />
            ) : (
              <img src={alertaIcon} alt='AlertaGT Icon' />
            )}
          </div>
          <h1>
            {status === 'loading' && 'Verificando tu correo...'}
            {status === 'success' && '¡Correo verificado!'}
            {status === 'error' && 'No pudimos verificar tu correo'}
          </h1>
          <p>{status === 'loading' ? 'Esto solo toma un momento.' : message}</p>
        </div>

        {status !== 'loading' && (
          <button type='button' className='primary-button' onClick={() => navigate('/')}>
            {status === 'success' ? 'Ir a iniciar sesión' : 'Volver al inicio'}
          </button>
        )}

        {status === 'error' && (
          <p className='register-terms'>
            ¿El enlace expiró? <Link to='/'>Volvé al login</Link> y pedí uno nuevo desde ahí.
          </p>
        )}
      </section>
    </main>
  )
}

export default VerifyEmailPage
