// Resumen del panel: KPIs agregados de moderación, alertas y reputación.

import { useState, useEffect, useCallback } from 'react'
import { getDashboardSummary } from '../services/adminService.js'
import { KpiCard } from './AdminUI.jsx'

const IconFlag = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7' /></svg>
)
const IconAlert = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01' /></svg>
)
const IconUsers = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' /><circle cx='9' cy='7' r='4' /><path d='M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' /></svg>
)
const IconShield = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' /></svg>
)

export const AdminOverview = ({ onNavigate }) => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setSummary(await getDashboardSummary())
    } catch (err) {
      setError(err.message || 'No se pudo cargar el resumen')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className='admin-loading'>Cargando resumen del sistema...</div>
  if (error) return <div className='admin-error'>{error}</div>
  if (!summary) return null

  const { reports, alerts, users, failed } = summary
  const anyFailed = failed.reports || failed.alerts || failed.users

  return (
    <section>
      <div className='admin-section-head'>
        <div>
          <h2>Resumen del sistema</h2>
          <p>Estado general de moderación, alertas activas y reputación de la comunidad.</p>
        </div>
        <button type='button' className='admin-action neutral' onClick={load}>Actualizar</button>
      </div>

      {anyFailed && (
        <p className='admin-inline-error'>
          Algunos datos no se pudieron cargar
          {failed.reports && ' · reportes'}
          {failed.alerts && ' · alertas'}
          {failed.users && ' · reputación'}
          . En el plan free de Render los servicios se duermen: reintenta en unos segundos.
        </p>
      )}

      <div className='admin-kpi-grid'>
        <KpiCard
          icon={<IconFlag />}
          label='Reportes pendientes'
          value={reports.pending}
          hint='Requieren tu revisión'
          accent={reports.pending > 0 ? 'danger' : 'ok'}
        />
        <KpiCard
          icon={<IconAlert />}
          label='Alertas publicadas'
          value={alerts.active}
          hint='Alertas publicadas (todo el tiempo)'
        />
        <KpiCard
          icon={<IconUsers />}
          label='Usuarios suspendidos'
          value={users.suspended}
          hint='No pueden publicar alertas'
          accent={users.suspended > 0 ? 'danger' : 'ok'}
        />
        <KpiCard
          icon={<IconUsers />}
          label='Usuarios en aviso'
          value={users.warned}
          hint='Cerca del umbral de suspensión'
          accent={users.warned > 0 ? 'warn' : 'ok'}
        />
        <KpiCard
          icon={<IconShield />}
          label='Confianza promedio'
          value={users.averageTrust}
          hint={users.tracked ? `Sobre ${users.tracked} usuarios con historial` : 'Sin usuarios con historial'}
        />
        <KpiCard
          icon={<IconAlert />}
          label='Alertas reportadas'
          value={users.falseAlerts}
          hint='Acumulado histórico'
          accent={users.falseAlerts > 0 ? 'warn' : 'ok'}
        />
        <KpiCard
          icon={<IconFlag />}
          label='Reportes confirmados'
          value={reports.upheld}
          hint='Resueltos como falsos'
        />
        <KpiCard
          icon={<IconFlag />}
          label='Reportes desestimados'
          value={reports.dismissed}
          hint='Revisados y descartados'
        />
      </div>

      {reports.pending > 0 && (
        <p className='admin-inline-notice'>
          Hay {reports.pending} {reports.pending === 1 ? 'reporte' : 'reportes'} esperando revisión.{' '}
          <button
            type='button'
            className='admin-action neutral'
            onClick={() => onNavigate?.('reports')}
          >
            Ir a la cola de moderación
          </button>
        </p>
      )}
    </section>
  )
}
