import { StarRating } from './StarRating.jsx'

const STATUS_META = {
  ACTIVE: { label: 'Activo', className: 'rep-status-active', emoji: '🟢' },
  WARNED: { label: 'En aviso', className: 'rep-status-warned', emoji: '🟡' },
  SUSPENDED: { label: 'Suspendido', className: 'rep-status-suspended', emoji: '🔴' },
}

// Color de la barra de confianza según el puntaje.
const trustColor = (score) => {
  if (score >= 70) return '#16a34a'
  if (score >= 40) return '#d97706'
  return '#dc2626'
}

/**
 * Insignia de reputación de un usuario: confianza, estrellas y estado.
 * `compact` muestra solo la fila resumida (para tarjetas de autor).
 */
export const ReputationBadge = ({ reputation, ratingSummary, compact = false }) => {
  if (!reputation) return null

  const status = STATUS_META[reputation.status] || STATUS_META.ACTIVE
  const avg = ratingSummary?.average ?? reputation.averageRating ?? 0
  const count = ratingSummary?.count ?? reputation.ratingsCount ?? 0
  const trust = reputation.trustScore ?? 0

  return (
    <div className={`reputation-badge ${compact ? 'compact' : ''}`}>
      <div className='rep-row'>
        <span className={`rep-status ${status.className}`}>
          {status.emoji} {status.label}
        </span>
        <span className='rep-trust-label'>Confianza {trust}/100</span>
      </div>

      <div className='rep-trust-bar'>
        <div
          className='rep-trust-fill'
          style={{ width: `${trust}%`, background: trustColor(trust) }}
        />
      </div>

      <div className='rep-row rep-stars-row'>
        <StarRating value={Math.round(avg)} readOnly size={16} />
        <span className='rep-stars-text'>
          {avg.toFixed(1)} · {count} calificación{count === 1 ? '' : 'es'}
        </span>
      </div>

      {!compact && reputation.falseAlertsCount > 0 && (
        <p className='rep-false-note'>
          ⚠️ {reputation.falseAlertsCount} alerta{reputation.falseAlertsCount === 1 ? '' : 's'} confirmada{reputation.falseAlertsCount === 1 ? '' : 's'} como falsa{reputation.falseAlertsCount === 1 ? '' : 's'}
        </p>
      )}

      {!compact && reputation.status === 'SUSPENDED' && reputation.suspendedUntil && (
        <p className='rep-suspended-note'>
          Suspendido para publicar hasta {new Date(reputation.suspendedUntil).toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}
