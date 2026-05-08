import { useNavigate } from 'react-router-dom'

export const DashboardPage = () => {
  const navigate = useNavigate()

  return (
    <main className='dashboard-shell'>
      <section className='dashboard-card'>
        <h1>Panel de administración</h1>
        <p>Bienvenido al panel de administración de AlertaGT.</p>
        <div className='dashboard-actions'>
          <button className='ghost-button' onClick={() => navigate('/')}>
            Cerrar sesión
          </button>
        </div>
      </section>
    </main>
  )
}
