// Gestión de reputación: ranking de usuarios por confianza, penalizaciones
// manuales y recálculo desde el historial.

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getLeaderboard,
  getReputation,
  penalizeUser,
  recomputeReputation,
  REPUTATION_STATUS,
} from '../services/adminService.js'
import { StatusBadge, Modal, formatDate, shortId } from './AdminUI.jsx'

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: REPUTATION_STATUS.SUSPENDED, label: 'Suspendidos' },
  { value: REPUTATION_STATUS.WARNED, label: 'En aviso' },
  { value: REPUTATION_STATUS.ACTIVE, label: 'Activos' },
]

export const AdminReputation = () => {
  const [users, setUsers] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [penalizing, setPenalizing] = useState(null)
  const [points, setPoints] = useState('20')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [busyUserId, setBusyUserId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setUsers(await getLeaderboard(100))
    } catch (err) {
      setError(err.message || 'No se pudo cargar el ranking de reputación')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return users
    return users.filter((user) => user.status === statusFilter)
  }, [users, statusFilter])

  const runSearch = async (event) => {
    event.preventDefault()
    const userId = search.trim()
    if (!userId) {
      setSearchResult(null)
      return
    }
    setSearching(true)
    setError('')
    try {
      const result = await getReputation(userId)
      // El backend crea la reputación si no existe, así que un usuario nuevo
      // devuelve valores por defecto en vez de 404.
      setSearchResult(result)
    } catch (err) {
      setError(err.message || 'No se pudo consultar ese usuario')
      setSearchResult(null)
    } finally {
      setSearching(false)
    }
  }

  const openPenalize = (user) => {
    setPenalizing(user)
    setPoints('20')
    setReason('')
  }

  const applyPenalty = async () => {
    if (!penalizing) return
    const numericPoints = Number(points)
    if (!Number.isFinite(numericPoints) || numericPoints <= 0) {
      setError('Los puntos de penalización deben ser un número mayor que cero')
      return
    }
    setBusy(true)
    setError('')
    try {
      await penalizeUser(penalizing.userId, {
        points: numericPoints,
        reason: reason.trim() || 'Penalización manual',
      })
      setPenalizing(null)
      await load()
      if (searchResult?.userId === penalizing.userId) {
        setSearchResult(await getReputation(penalizing.userId))
      }
    } catch (err) {
      setError(err.message || 'No se pudo aplicar la penalización')
    } finally {
      setBusy(false)
    }
  }

  const runRecompute = async (userId) => {
    setBusyUserId(userId)
    setError('')
    try {
      await recomputeReputation(userId)
      await load()
      if (searchResult?.userId === userId) {
        setSearchResult(await getReputation(userId))
      }
    } catch (err) {
      setError(err.message || 'No se pudo recalcular la reputación')
    } finally {
      setBusyUserId(null)
    }
  }

  const renderRow = (user) => (
    <tr key={user.userId}>
      <td className='admin-mono' title={user.userId}>{shortId(user.userId)}</td>
      <td className='admin-cell-strong'>{user.trustScore ?? '—'}</td>
      <td><StatusBadge status={user.status} /></td>
      <td className='admin-cell-muted'>
        {user.ratingsCount > 0
          ? `${Number(user.averageRating ?? 0).toFixed(1)} ★ (${user.ratingsCount})`
          : 'Sin calificaciones'}
      </td>
      <td className={user.falseAlertsCount > 0 ? 'admin-cell-strong' : 'admin-cell-muted'}>
        {user.falseAlertsCount ?? 0}
      </td>
      <td className='admin-cell-muted'>{user.reportsReceived ?? 0}</td>
      <td className='admin-cell-muted'>
        {user.status === REPUTATION_STATUS.SUSPENDED && user.suspendedUntil
          ? formatDate(user.suspendedUntil)
          : '—'}
      </td>
      <td className='admin-cell-actions'>
        <button
          type='button'
          className='admin-action neutral'
          onClick={() => runRecompute(user.userId)}
          disabled={busyUserId === user.userId}
        >
          {busyUserId === user.userId ? 'Recalculando...' : 'Recalcular'}
        </button>
        <button type='button' className='admin-action danger' onClick={() => openPenalize(user)}>
          Penalizar
        </button>
      </td>
    </tr>
  )

  const TableHead = () => (
    <thead>
      <tr>
        <th>Usuario</th>
        <th>Confianza</th>
        <th>Estado</th>
        <th>Calificación</th>
        <th>Alertas falsas</th>
        <th>Reportes recibidos</th>
        <th>Suspendido hasta</th>
        <th />
      </tr>
    </thead>
  )

  return (
    <section>
      <div className='admin-section-head'>
        <div>
          <h2>Reputación de usuarios</h2>
          <p>
            La confianza va de 0 a 100. Al superar los umbrales de penalización el usuario pasa
            a aviso y luego a suspensión automática, que le impide publicar alertas.
          </p>
        </div>
        <form className='admin-search' onSubmit={runSearch}>
          <input
            type='text'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Buscar por ID de usuario'
            aria-label='Buscar reputación por ID de usuario'
          />
          <button type='submit' className='admin-action neutral' disabled={searching}>
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {error && <p className='admin-inline-error'>{error}</p>}

      {searchResult && (
        <>
          <div className='admin-section-head' style={{ marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1rem' }}>Resultado de búsqueda</h2>
            <button
              type='button'
              className='admin-action neutral'
              onClick={() => { setSearchResult(null); setSearch('') }}
            >
              Limpiar
            </button>
          </div>
          <div className='admin-table-wrap' style={{ marginBottom: '1.75rem' }}>
            <table className='admin-table'>
              <TableHead />
              <tbody>{renderRow(searchResult)}</tbody>
            </table>
          </div>
        </>
      )}

      <div className='admin-section-head'>
        <div>
          <h2 style={{ fontSize: '1rem' }}>Ranking por confianza</h2>
          <p>Hasta 100 usuarios con historial de reputación, de mayor a menor confianza.</p>
        </div>
        <div className='admin-filters'>
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type='button'
              className={`admin-filter-chip ${statusFilter === filter.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className='admin-table-wrap'>
        {loading ? (
          <div className='admin-loading'>Cargando reputación...</div>
        ) : filtered.length === 0 ? (
          <div className='admin-empty'>
            {users.length === 0
              ? 'Todavía no hay usuarios con historial de reputación.'
              : 'Ningún usuario coincide con este filtro.'}
          </div>
        ) : (
          <table className='admin-table'>
            <TableHead />
            <tbody>{filtered.map(renderRow)}</tbody>
          </table>
        )}
      </div>

      {penalizing && (
        <Modal
          title='Penalizar usuario'
          subtitle='Los puntos se restan de su confianza. Si alcanza el umbral de suspensión, quedará suspendido automáticamente y no podrá publicar alertas.'
          onClose={() => setPenalizing(null)}
          onConfirm={applyPenalty}
          confirmLabel='Aplicar penalización'
          busy={busy}
        >
          <p className='admin-cell-muted' style={{ marginTop: 0 }}>
            Usuario: <span className='admin-mono'>{penalizing.userId}</span>
            {' · '}confianza actual <strong>{penalizing.trustScore}</strong>
          </p>
          <label className='admin-field'>
            <span>Puntos de penalización</span>
            <input
              type='number'
              min='1'
              value={points}
              onChange={(event) => setPoints(event.target.value)}
            />
          </label>
          <label className='admin-field'>
            <span>Motivo</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder='Ej: Publicación reiterada de alertas falsas'
            />
          </label>
        </Modal>
      )}
    </section>
  )
}
