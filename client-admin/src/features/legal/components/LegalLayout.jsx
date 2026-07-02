import { useNavigate, Link } from 'react-router-dom'
import '../styles/legal.css'

export const LegalLayout = ({ title, updatedAt, children }) => {
  const navigate = useNavigate()

  return (
    <div className='legal-page'>
      <header className='legal-header'>
        <button className='legal-header-btn' onClick={() => navigate(-1)} aria-label='Regresar'>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M15 18 9 12l6-6' />
          </svg>
        </button>
        <h1 className='legal-header-title'>{title}</h1>
        <span className='legal-header-spacer' />
      </header>

      <main className='legal-content'>
        <article className='legal-card'>
          <div className='legal-doc-head'>
            <h2>{title}</h2>
            <p className='legal-updated'>Última actualización: {updatedAt}</p>
          </div>

          {children}

          <div className='legal-footer-note'>
            <p>
              ¿Tienes preguntas? Escríbenos a{' '}
              <a href='mailto:official.hexacodee@gmail.com'>official.hexacodee@gmail.com</a>.
            </p>
            <p className='legal-cross-link'>
              Consulta también nuestra{' '}
              <Link to='/terms'>Términos de Servicio</Link> y{' '}
              <Link to='/privacy'>Política de Privacidad</Link>.
            </p>
          </div>
        </article>
      </main>
    </div>
  )
}
