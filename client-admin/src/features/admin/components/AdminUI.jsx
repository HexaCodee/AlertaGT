// Piezas de UI reutilizables del panel de administración.

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  UPHELD: 'Confirmado',
  DISMISSED: 'Desestimado',
  ACTIVE: 'Activo',
  WARNED: 'En aviso',
  SUSPENDED: 'Suspendido',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
}

// Insignia de estado. La clase se deriva del propio estado (ver admin.css).
export const StatusBadge = ({ status }) => {
  if (!status) return <span className='admin-cell-muted'>—</span>
  return (
    <span className={`admin-badge ${String(status).toLowerCase()}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export const KpiCard = ({ label, value, hint, accent, icon }) => {
  // value === null significa "no se pudo cargar", distinto de 0.
  const unavailable = value === null || value === undefined
  return (
    <article className={`admin-kpi ${accent ? `accent-${accent}` : ''}`}>
      <div className='admin-kpi-label'>
        {icon}
        <span>{label}</span>
      </div>
      <div className={`admin-kpi-value ${unavailable ? 'is-empty' : ''}`}>
        {unavailable ? 'Sin datos' : value}
      </div>
      {hint && <div className='admin-kpi-hint'>{hint}</div>}
    </article>
  )
}

export const Pagination = ({ pagination, page, onPageChange, loading }) => {
  if (!pagination) return null
  const totalPages = pagination.totalPages || 1
  if (totalPages <= 1) return null

  return (
    <div className='admin-pagination'>
      <button type='button' disabled={loading || page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </button>
      <span>
        Página {page} de {totalPages} · {pagination.totalRecords} registros
      </span>
      <button type='button' disabled={loading || page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Siguiente
      </button>
    </div>
  )
}

export const Modal = ({ title, subtitle, children, onClose, onConfirm, confirmLabel = 'Confirmar', confirmVariant = 'danger', busy }) => (
  <div className='admin-modal-backdrop' role='dialog' aria-modal='true' onClick={onClose}>
    <div className='admin-modal' onClick={(event) => event.stopPropagation()}>
      <h3>{title}</h3>
      {subtitle && <p className='admin-modal-sub'>{subtitle}</p>}
      {children}
      <div className='admin-modal-actions'>
        <button type='button' className='admin-action neutral' onClick={onClose} disabled={busy}>
          Cancelar
        </button>
        <button type='button' className={`admin-action ${confirmVariant}`} onClick={onConfirm} disabled={busy}>
          {busy ? 'Aplicando...' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
)

// Fecha corta legible (es-GT). Devuelve '—' si no hay valor.
export const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('es-GT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Recorta ids largos (uuid) para que la tabla siga siendo legible.
export const shortId = (id) => {
  if (!id) return '—'
  const value = String(id)
  return value.length <= 12 ? value : `${value.slice(0, 8)}…${value.slice(-4)}`
}
