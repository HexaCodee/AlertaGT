// Moderación de alertas: revisar las alertas activas y retirar de la vista
// pública las que sean falsas o inapropiadas.

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { listAlerts, moderateAlert, MODERATION_STATUS } from '../services/adminService.js'
import { StatusBadge, Pagination, Modal, formatDate, shortId } from './AdminUI.jsx'

const CATEGORY_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'ACCIDENTE', label: 'Accidente' },
  { value: 'TRAFICO', label: 'Tráfico' },
  { value: 'PELIGRO', label: 'Peligro' },
  { value: 'OTROS', label: 'Otros' },
]

const CATEGORY_LABELS = {
  ACCIDENTE: 'Accidente',
  TRAFICO: 'Tráfico',
  PELIGRO: 'Peligro',
  OTROS: 'Otros',
}

const RISK_LABELS = { LEVE: 'Leve', MODERADO: 'Moderado', GRAVE: 'Grave' }

export const AdminAlerts = () => {
  const navigate = useNavigate()
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [alerts, setAlerts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Alerta en proceso de moderación: { alert, status }
  const [moderating, setModerating] = useState(null)
  const [comments, setComments] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await listAlerts({ page, limit: 20, category })
      setAlerts(result.alerts)
      setPagination(result.pagination)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las alertas')
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [page, category])

  useEffect(() => { load() }, [load])

  const changeCategory = (value) => {
    setCategory(value)
    setPage(1)
  }

  const openModeration = (alert, status) => {
    setModerating({ alert, status })
    setComments('')
  }

  const applyModeration = async () => {
    if (!moderating) return
    setBusy(true)
    setError('')
    try {
      await moderateAlert(moderating.alert._id, { status: moderating.status, comments })
      setModerating(null)
      await load()
    } catch (err) {
      setError(err.message || 'No se pudo moderar la alerta')
    } finally {
      setBusy(false)
    }
  }

  const isReject = moderating?.status === MODERATION_STATUS.REJECTED

  return (
    <section>
      <div className='admin-section-head'>
        <div>
          <h2>Alertas activas</h2>
          <p>
            Rechazar una alerta la retira de la vista pública. Solo aparecen las alertas
            publicadas y vigentes: las expiradas ya no se muestran a los usuarios.
          </p>
        </div>
        <div className='admin-filters'>
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type='button'
              className={`admin-filter-chip ${category === filter.value ? 'active' : ''}`}
              onClick={() => changeCategory(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className='admin-inline-error'>{error}</p>}

      <div className='admin-table-wrap'>
        {loading ? (
          <div className='admin-loading'>Cargando alertas...</div>
        ) : alerts.length === 0 ? (
          <div className='admin-empty'>No hay alertas activas con este filtro.</div>
        ) : (
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoría</th>
                <th>Riesgo</th>
                <th>Autor</th>
                <th>Publicada</th>
                <th>Marcas</th>
                <th>Moderación</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert._id}>
                  <td className='admin-cell-strong' title={alert.text}>{alert.title}</td>
                  <td>{CATEGORY_LABELS[alert.category] ?? alert.category}</td>
                  <td className='admin-cell-muted'>{RISK_LABELS[alert.riskType] ?? alert.riskType}</td>
                  <td className='admin-mono' title={alert.authorId}>{shortId(alert.authorId)}</td>
                  <td className='admin-cell-muted'>{formatDate(alert.createdAt)}</td>
                  <td className={alert.flaggedCount > 0 ? 'admin-cell-strong' : 'admin-cell-muted'}>
                    {alert.flaggedCount ?? 0}
                  </td>
                  <td><StatusBadge status={alert.moderation?.status} /></td>
                  <td className='admin-cell-actions'>
                    <button
                      type='button'
                      className='admin-action neutral'
                      onClick={() => navigate(`/alerts/${alert._id}`)}
                    >
                      Ver
                    </button>
                    {alert.moderation?.status !== MODERATION_STATUS.REJECTED && (
                      <button
                        type='button'
                        className='admin-action danger'
                        onClick={() => openModeration(alert, MODERATION_STATUS.REJECTED)}
                      >
                        Rechazar
                      </button>
                    )}
                    {alert.moderation?.status !== MODERATION_STATUS.APPROVED && (
                      <button
                        type='button'
                        className='admin-action ok'
                        onClick={() => openModeration(alert, MODERATION_STATUS.APPROVED)}
                      >
                        Aprobar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination pagination={pagination} page={page} onPageChange={setPage} loading={loading} />

      {moderating && (
        <Modal
          title={isReject ? 'Rechazar alerta' : 'Aprobar alerta'}
          subtitle={
            isReject
              ? 'La alerta dejará de mostrarse a los usuarios. Puedes dejar una nota interna con el motivo.'
              : 'La alerta quedará marcada como revisada y aprobada.'
          }
          onClose={() => setModerating(null)}
          onConfirm={applyModeration}
          confirmLabel={isReject ? 'Rechazar alerta' : 'Aprobar alerta'}
          confirmVariant={isReject ? 'danger' : 'ok'}
          busy={busy}
        >
          <p className='admin-cell-muted' style={{ marginTop: 0 }}>
            Alerta: <strong>{moderating.alert.title}</strong>
          </p>
          <label className='admin-field'>
            <span>Nota de moderación (opcional)</span>
            <textarea
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              placeholder={isReject ? 'Ej: Información falsa confirmada por la comunidad' : 'Ej: Revisada, contenido válido'}
            />
          </label>
        </Modal>
      )}
    </section>
  )
}
