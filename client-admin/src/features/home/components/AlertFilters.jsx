import { memo } from 'react'

const CategoryButton = memo(({ category, label, emoji, isActive, onClick }) => (
  <button
    className={`category-button ${isActive ? 'active' : ''}`}
    onClick={onClick}
    aria-pressed={isActive}
    title={label}
  >
    <span className='category-emoji'>{emoji}</span>
    <span className='category-label'>{label}</span>
  </button>
))

CategoryButton.displayName = 'CategoryButton'

export const AlertFilters = memo(({
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange
}) => {
  const categories = [
    { value: 'all', label: 'Todas', emoji: '📋' },
    { value: 'ACCIDENTE', label: 'Accidente', emoji: '🚨' },
    { value: 'TRAFICO', label: 'Tráfico', emoji: '🚗' },
    { value: 'PELIGRO', label: 'Peligro', emoji: '⚠️' },
    { value: 'OTROS', label: 'Otros', emoji: '📌' }
  ]

  return (
    <div className='filters-section'>
      <div className='categories-container'>
        <div className='categories-scroll'>
          {categories.map(cat => (
            <CategoryButton
              key={cat.value}
              category={cat.value}
              label={cat.label}
              emoji={cat.emoji}
              isActive={selectedCategory === cat.value}
              onClick={() => onCategoryChange(cat.value)}
            />
          ))}
        </div>
      </div>

      <div className='sort-container'>
        <label htmlFor='sort-select' className='sort-label'>
          Ordenar por:
        </label>
        <select
          id='sort-select'
          className='sort-select'
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label='Ordenar alertas'
        >
          <option value='distance'>Distancia más cercana</option>
          <option value='recent'>Más recientes primero</option>
        </select>
      </div>
    </div>
  )
})

AlertFilters.displayName = 'AlertFilters'
