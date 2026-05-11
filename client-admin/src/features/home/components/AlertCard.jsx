import { memo } from 'react'

const CategoryBadge = memo(({ category }) => {
  const categoryConfig = {
    ACCIDENTE: { label: 'Accidente', color: '#8b0000' },
    TRAFICO: { label: 'Tráfico', color: '#ef4444' },
    PELIGRO: { label: 'Peligro', color: '#f59e0b' },
    OTROS: { label: 'Otros', color: '#6b7280' }
  }

  const config = categoryConfig[category] || categoryConfig.OTROS

  return (
    <span
      className='category-badge'
      style={{ '--badge-color': config.color }}
    >
      {config.label}
    </span>
  )
})

CategoryBadge.displayName = 'CategoryBadge'

export const AlertCard = memo(({ alert }) => {
  const handleViewDetails = () => {
    console.log('Ver detalles de alerta:', alert.id)
  }

  const formatDate = (date) => {
    const now = new Date()
    const alertDate = new Date(date)
    const diffMs = now - alertDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Hace momentos'
    if (diffMins < 60) return `Hace ${diffMins}m`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return alertDate.toLocaleDateString('es-GT', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <article className='alert-card'>
      <div className='alert-image-container'>
        <img
          src={alert.image}
          alt={alert.title}
          className='alert-image'
          loading='lazy'
        />
        <div className='alert-overlay'>
          <CategoryBadge category={alert.category} />
          <span className='distance-badge'>{alert.distance}m</span>
        </div>
      </div>

      <div className='alert-content'>
        <div className='alert-header'>
          <h2 className='alert-title'>{alert.title}</h2>
          <time className='alert-time'>{formatDate(alert.date)}</time>
        </div>

        <p className='alert-description'>{alert.description}</p>

        <div className='alert-meta'>
          <div className='meta-item'>
            <svg className='meta-icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
              <circle cx='12' cy='10' r='3' />
            </svg>
            <span>{alert.location}</span>
          </div>

          <div className='meta-item'>
            <svg className='meta-icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
              <circle cx='9' cy='7' r='4' />
              <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
              <path d='M16 3.13a4 4 0 0 1 0 7.75' />
            </svg>
            <span>{alert.reportedBy}</span>
          </div>
        </div>

        <button
          className='view-details-btn'
          onClick={handleViewDetails}
          aria-label={`Ver detalles de ${alert.title}`}
        >
          Ver detalles
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <polyline points='9 18 15 12 9 6' />
          </svg>
        </button>
      </div>
    </article>
  )
})

AlertCard.displayName = 'AlertCard'
