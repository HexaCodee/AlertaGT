// Cola de moderación de reportes: revisar y resolver los reportes que la
// comunidad envía sobre alertas presuntamente falsas.

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { listReports, resolveReport, REPORT_STATUS, REPORT_REASON_LABELS } from '../services/adminService.js'
import { StatusBadge, Pagination, Modal, formatDate, shortId } from './AdminUI.jsx'

const FILTERS = [
  { value: REPORT_STATUS.PENDING, label: 'Pendientes' },
  { value: REPORT_STATUS.UPHELD, label: 'Confirmados' },
  { value: REPORT_STATUS.DISMISSED, label: 'Desestimados' },
  { value: '', label: 'Todos' },
]

export const AdminReports = ({ onResolved }) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState(REPORT_STATUS.PENDING)
  const [page, setPage] = useState(1)
  const [reports, setReports] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Reporte en proceso de resolución: { report, decision }
  const [confirming, setConfirming] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await listReports({ status: status || undefined, page, limit: 20 })
      setReports(result.reports)
      setPagination(result.pagination)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los reportes')
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [status, page])

  useEffect(() => { load() }, [load])

  const changeFilter = (value) => {
    setStatus(value)
    setPage(1)
  }

  const applyDecision = async () => {
    if (!confirming) return
    setBusy(true)
    setError('')
    try {
      await resolveReport(confirming.report._id, confirming.decision)
      setConfirming(null)
      await load()
      onResolved?.()
    } catch (err) {
      setError(err.message || 'No se pudo resolver el reporte')
    } finally {
      setBusy(false)
    }
  }

  const isUphold = confirming?.decision === REPORT_STATUS.UPHELD

  return (
    <section>
      <div className='admin-section-head'>
        <div>
          <h2>Cola de moderación</h2>
          <p>
            Confirmar un reporte marca la alerta como falsa y penaliza la reputación de su autor.
            Desestimarlo lo descarta sin consecuencias.
          </p>
        </div>
        <div className='admin-filters'>
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              type='button'
              className={`admin-filter-chip ${status === filter.value ? 'active' : ''}`}
              onClick={() => changeFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className='admin-inline-error'>{error}</p>}

      <div className='admin-table-wrap'>
        {loading ? (
          <div className='admin-loading'>Cargando reportes...</div>
        ) : reports.length === 0 ? (
          <div className='admin-empty'>
            {status === REPORT_STATUS.PENDING
              ? 'No hay reportes pendientes. La cola está limpia.'
              : 'No hay reportes con este filtro.'}
          </div>
        ) : (
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Motivo</th>
                <th>Comentario</th>
                <th>Alerta</th>
                <th>Autor</th>
                <th>Reportado</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id}>
                  <td className='admin-cell-strong'>
                    {REPORT_REASON_LABELS[report.reason] ?? report.reason}
                  </td>
                  <td className='admin-cell-muted'>
                    {report.comment?.trim() ? report.comment : <span className='admin-cell-muted'>Sin comentario</span>}
                  </td>
                  <td>
                    <button
                      type='button'
                      className='admin-action neutral'
                      onClick={() => navigate(`/alerts/${report.postId}`)}
                      title='Ver la alerta reportada'
                    >
                      Ver alerta
                    </button>
                  </td>
                  <td className='admin-mono' title={report.authorId}>{shortId(report.authorId)}</td>
                  <td className='admin-cell-muted'>{formatDate(report.createdAt)}</td>
                  <td><StatusBadge status={report.status} /></td>
                  <td className='admin-cell-actions'>
                    {report.status === REPORT_STATUS.PENDING ? (
                      <>
                        <button
                          type='button'
                          className='admin-action danger'
                          onClick={() => setConfirming({ report, decision: REPORT_STATUS.UPHELD })}
                        >
                          Confirmar
                        </button>
                        <button
                          type='button'
                          className='admin-action neutral'
                          onClick={() => setConfirming({ report, decision: REPORT_STATUS.DISMISSED })}
                        >
                          Desestimar
                        </button>
                      </>
                    ) : (
                      <span className='admin-cell-muted'>
                        {report.resolvedAt ? `Resuelto ${formatDate(report.resolvedAt)}` : 'Resuelto'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination pagination={pagination} page={page} onPageChange={setPage} loading={loading} />

      {confirming && (
        <Modal
          title={isUphold ? 'Confirmar reporte' : 'Desestimar reporte'}
          subtitle={
            isUphold
              ? 'La alerta quedará marcada como falsa y su autor recibirá una penalización de reputación. Si acumula suficientes puntos, será suspendido automáticamente.'
              : 'El reporte se descartará y no afectará la reputación del autor de la alerta.'
          }
          onClose={() => setConfirming(null)}
          onConfirm={applyDecision}
          confirmLabel={isUphold ? 'Confirmar como falsa' : 'Desestimar'}
          confirmVariant={isUphold ? 'danger' : 'neutral'}
          busy={busy}
        >
          <p className='admin-cell-muted'>
            Motivo reportado: <strong>{REPORT_REASON_LABELS[confirming.report.reason] ?? confirming.report.reason}</strong>
          </p>
        </Modal>
      )}
    </section>
  )
}
