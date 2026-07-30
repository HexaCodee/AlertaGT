// Panel de administración de AlertaGT.
//
// Solo accesible con rol ADMIN_ROLE o MODERATOR_ROLE (el claim "role" del JWT).
// Agrupa en pestañas todo lo que el backend expone para administración:
// resumen, cola de reportes, moderación de alertas y reputación de usuarios.

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken, getCurrentUserRole, isAdmin } from '../../../shared/utils/session.js'
import { listReports, REPORT_STATUS } from '../services/adminService.js'
import { AdminOverview } from '../components/AdminOverview.jsx'
import { AdminReports } from '../components/AdminReports.jsx'
import { AdminAlerts } from '../components/AdminAlerts.jsx'
import { AdminReputation } from '../components/AdminReputation.jsx'
import '../styles/admin.css'

const ROLE_LABELS = {
  ADMIN_ROLE: 'Administrador',
  MODERATOR_ROLE: 'Moderador',
}

const TABS = [
  { id: 'overview', label: 'Resumen' },
  { id: 'reports', label: 'Reportes' },
  { id: 'alerts', label: 'Alertas' },
  { id: 'reputation', label: 'Reputación' },
]

export const AdminPage = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [pendingCount, setPendingCount] = useState(null)

  const hasSession = Boolean(getToken())
  const allowed = hasSession && isAdmin()

  // Conteo de reportes pendientes para el indicador de la pestaña.
  const refreshPendingCount = useCallback(async () => {
    if (!allowed) return
    try {
      const { pagination } = await listReports({ status: REPORT_STATUS.PENDING, limit: 1 })
      setPendingCount(pagination?.totalRecords ?? 0)
    } catch {
      setPendingCount(null)
    }
  }, [allowed])

  useEffect(() => { refreshPendingCount() }, [refreshPendingCount])

  if (!allowed) {
    return (
      <div className='admin-denied'>
        <div className='admin-denied-card'>
          <h1>Acceso restringido</h1>
          <p>
            {hasSession
              ? 'Tu cuenta no tiene permisos de administración. Si crees que es un error, contacta a un administrador.'
              : 'Necesitas iniciar sesión con una cuenta de administración para entrar al panel.'}
          </p>
          <button type='button' onClick={() => navigate(hasSession ? '/home' : '/')}>
            {hasSession ? 'Volver a la app' : 'Ir a iniciar sesión'}
          </button>
        </div>
      </div>
    )
  }

  const role = getCurrentUserRole()

  return (
    <div className='admin-shell'>
      <header className='admin-header'>
        <div className='admin-header-top'>
          <div className='admin-titles'>
            <h1>Panel de administración</h1>
            <p>AlertaGT · moderación y reputación de la comunidad</p>
            <span className='admin-role-chip'>
              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' width='13' height='13'>
                <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
              </svg>
              {ROLE_LABELS[role] ?? role}
            </span>
          </div>
          <div className='admin-header-actions'>
            <button type='button' className='admin-ghost-button' onClick={() => navigate('/home')}>
              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <path d='M19 12H5m7-7-7 7 7 7' />
              </svg>
              Volver a la app
            </button>
          </div>
        </div>

        <nav className='admin-tabs' aria-label='Secciones del panel'>
          {TABS.map((item) => {
            const isActive = tab === item.id
            const showCount = item.id === 'reports' && pendingCount > 0
            return (
              <button
                key={item.id}
                type='button'
                className={`admin-tab ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setTab(item.id)}
              >
                {item.label}
                {showCount && <span className='admin-tab-count'>{pendingCount}</span>}
              </button>
            )
          })}
        </nav>
      </header>

      <main className='admin-content'>
        {tab === 'overview' && <AdminOverview onNavigate={setTab} />}
        {tab === 'reports' && <AdminReports onResolved={refreshPendingCount} />}
        {tab === 'alerts' && <AdminAlerts />}
        {tab === 'reputation' && <AdminReputation />}
      </main>
    </div>
  )
}
