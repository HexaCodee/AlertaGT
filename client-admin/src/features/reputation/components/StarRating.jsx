import { useState } from 'react'

/**
 * Estrellas de calificación. Modo interactivo (onRate) o solo lectura (readOnly).
 */
export const StarRating = ({ value = 0, onRate, readOnly = false, size = 24 }) => {
  const [hover, setHover] = useState(0)
  const active = hover || value

  return (
    <div className='star-rating' role={readOnly ? 'img' : 'radiogroup'} aria-label={`Calificación: ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type='button'
          className={`star ${star <= active ? 'filled' : ''} ${readOnly ? 'readonly' : ''}`}
          style={{ width: size, height: size }}
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onRate?.(star)}
          aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
        >
          <svg viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 2l2.9 6.26 6.9.6-5.2 4.54 1.55 6.74L12 17.27 5.85 20.7l1.55-6.74L2.2 9.42l6.9-.6L12 2z' />
          </svg>
        </button>
      ))}
    </div>
  )
}
