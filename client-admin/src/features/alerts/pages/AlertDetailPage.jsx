import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  getAlertById,
  getComments,
  postComment,
  deleteAlert,
} from '../services/alertService'
import { getPublicProfile } from '../../profile/services/profileService.js'
import {
  getAlertVerdict,
  getReputation,
  getRatingSummary,
  rateUser,
} from '../../reputation/services/reputationService.js'
import { ReportAlertModal } from '../../reputation/components/ReportAlertModal.jsx'
import { ReputationBadge } from '../../reputation/components/ReputationBadge.jsx'
import { StarRating } from '../../reputation/components/StarRating.jsx'
import defaultAlert from '../../../assets/img/defaultAlert.png'
import '../styles/alert-detail.css'
import '../../reputation/styles/reputation.css'

const CATEGORY_META = {
  ACCIDENTE: { emoji: '🚗', label: 'Accidente', bg: '#fff3e0' },
  TRAFICO:   { emoji: '🚦', label: 'Tráfico', bg: '#e3f2fd' },
  PELIGRO:   { emoji: '⚠️', label: 'Peligro', bg: '#fff8e1' },
  OTROS:     { emoji: '📣', label: 'Otros', bg: '#f3e5f5' },
}

const RISK_META = {
  GRAVE:    { label: 'Grave', className: 'risk-grave' },
  MODERADO: { label: 'Moderado', className: 'risk-moderado' },
  LEVE:     { label: 'Leve', className: 'risk-leve' },
}

// Distancia en metros entre dos puntos GPS (Haversine)
const haversineMeters = (lat1, lng1, lat2, lng2) => {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const formatDistance = (meters) => {
  if (meters == null || Number.isNaN(Number(meters))) return null
  const m = Math.round(Number(meters))
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`
}

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatCommentDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = Math.floor((Date.now() - d) / 1000)
  if (diff < 60) return 'Hace un momento'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  return d.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })
}

// Decodifica el id del usuario actual desde el JWT (claim sub)
const getCurrentUserId = () => {
  const token = window.localStorage.getItem('authToken') || window.localStorage.getItem('token') || window.sessionStorage.getItem('token')
  if (!token) return null
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(decodeURIComponent(window.atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')))
    return payload.sub || payload.id || payload.userId || null
  } catch {
    return null
  }
}

const positionFromSession = () => {
  const savedLat = window.sessionStorage.getItem('user_lat')
  const savedLng = window.sessionStorage.getItem('user_lng')
  return savedLat && savedLng ? { latitude: parseFloat(savedLat), longitude: parseFloat(savedLng) } : null
}

// Obtiene la posición GPS ACTUAL (fresca), y solo si falla cae a la de sesión.
// Así la distancia refleja dónde estás ahora, igual que en Home.
const getUserPosition = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(positionFromSession()); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
        window.sessionStorage.setItem('user_lat', coords.latitude)
        window.sessionStorage.setItem('user_lng', coords.longitude)
        resolve(coords)
      },
      () => resolve(positionFromSession()),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  })

const initials = (name) => (name || '?').trim().charAt(0).toUpperCase()

export const AlertDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const routerLocation = useLocation()

  const currentUserId = useRef(getCurrentUserId()).current
  const [alert, setAlert] = useState(routerLocation.state?.alert ?? null)
  const [loading, setLoading] = useState(!routerLocation.state?.alert)
  const [error, setError] = useState('')
  const [distance, setDistance] = useState(null)

  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentError, setCommentError] = useState('')

  const [menuOpen, setMenuOpen] = useState(false)
  const [actionMsg, setActionMsg] = useState('')

  // ── Reputación / reportes ──
  const [showReportModal, setShowReportModal] = useState(false)
  const [verdict, setVerdict] = useState(null)
  const [authorReputation, setAuthorReputation] = useState(null)
  const [authorRatingSummary, setAuthorRatingSummary] = useState(null)
  const [myRating, setMyRating] = useState(0)
  const [ratingMsg, setRatingMsg] = useState('')

  // Nombres reales de autores (userId -> nombre para mostrar), resueltos vía auth-service
  const [authorNames, setAuthorNames] = useState({})
  const fetchedAuthorsRef = useRef(new Set())

  const resolveAuthorName = useCallback(
    (authorId) => {
      if (!authorId) return 'Miembro de la comunidad'
      if (authorId === currentUserId) return 'Tú'
      return authorNames[authorId] || 'Miembro de la comunidad'
    },
    [currentUserId, authorNames]
  )

  // Cargar la alerta (fuente de verdad) y recalcular distancia
  const loadAlert = useCallback(async () => {
    try {
      const data = await getAlertById(id)
      setAlert(data)
      const lat = data?.location?.latitude
      const lng = data?.location?.longitude
      if (lat != null && lng != null) {
        const pos = await getUserPosition()
        if (pos) setDistance(formatDistance(haversineMeters(pos.latitude, pos.longitude, lat, lng)))
        else if (data.distance != null) setDistance(formatDistance(data.distance))
      }
    } catch (err) {
      setError(err.message || 'No se pudo cargar la alerta')
    } finally {
      setLoading(false)
    }
  }, [id])

  const loadComments = useCallback(async () => {
    setCommentsLoading(true)
    try {
      const data = await getComments(id)
      setComments(Array.isArray(data) ? data : [])
    } catch {
      setComments([])
    } finally {
      setCommentsLoading(false)
    }
  }, [id])

  // Veredicto de reportes de la alerta (conteo / confirmada falsa)
  const loadVerdict = useCallback(async () => {
    try { setVerdict(await getAlertVerdict(id)) } catch { /* silencioso */ }
  }, [id])

  useEffect(() => { loadAlert() }, [loadAlert])
  useEffect(() => { loadComments() }, [loadComments])
  useEffect(() => { loadVerdict() }, [loadVerdict])

  // Reputación del autor (una vez que conocemos su id)
  useEffect(() => {
    const authorId = alert?.authorId
    if (!authorId) return
    Promise.all([getReputation(authorId), getRatingSummary(authorId)])
      .then(([rep, sum]) => { setAuthorReputation(rep); setAuthorRatingSummary(sum) })
      .catch(() => { /* silencioso: no romper la vista si reputación no responde */ })
  }, [alert?.authorId])

  // Resuelve el nombre real (auth-service) del autor de la alerta y de cada comentarista.
  // Usa un ref para no repetir peticiones ya hechas/en curso, y no rompe la vista si falla.
  useEffect(() => {
    const ids = new Set()
    if (alert?.authorId) ids.add(alert.authorId)
    comments.forEach((c) => c.authorId && ids.add(c.authorId))

    const toFetch = [...ids].filter(
      (authorId) => authorId !== currentUserId && !fetchedAuthorsRef.current.has(authorId)
    )
    if (toFetch.length === 0) return

    toFetch.forEach((authorId) => fetchedAuthorsRef.current.add(authorId))

    Promise.all(
      toFetch.map((authorId) =>
        getPublicProfile(authorId)
          .then((p) => {
            const fullName = `${p?.name ?? ''} ${p?.surname ?? ''}`.trim()
            return [authorId, fullName || p?.username || null]
          })
          .catch(() => [authorId, null])
      )
    ).then((pairs) => {
      setAuthorNames((prev) => {
        const next = { ...prev }
        pairs.forEach(([authorId, name]) => { if (name) next[authorId] = name })
        return next
      })
    })
  }, [alert?.authorId, comments, currentUserId])

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    const text = newComment.trim()
    if (!text) return
    if (!currentUserId) {
      setCommentError('Debes iniciar sesión para comentar')
      return
    }
    setSubmitting(true)
    setCommentError('')
    try {
      const created = await postComment(id, text)
      setComments((prev) => [created, ...prev])
      setNewComment('')
    } catch (err) {
      setCommentError(err.message || 'No se pudo publicar el comentario')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReport = () => {
    setMenuOpen(false)
    setShowReportModal(true)
  }

  // Resultado del modal de reporte: refrescamos veredicto y avisamos.
  const handleReported = (data) => {
    setShowReportModal(false)
    loadVerdict()
    if (data?.alertVerdict === 'CONFIRMED_FALSE') {
      setActionMsg('Reporte enviado. Esta alerta fue confirmada como falsa por la comunidad.')
    } else {
      setActionMsg('Reporte enviado. Gracias por ayudar a mantener la comunidad segura.')
    }
  }

  // Calificar al autor de la alerta
  const handleRate = async (score) => {
    setMyRating(score)
    setRatingMsg('')
    try {
      await rateUser({ targetUserId: alert.authorId, score, postId: id })
      setRatingMsg('¡Gracias por tu calificación!')
      // Refrescar el resumen del autor
      const [rep, sum] = await Promise.all([
        getReputation(alert.authorId),
        getRatingSummary(alert.authorId),
      ])
      setAuthorReputation(rep)
      setAuthorRatingSummary(sum)
    } catch (err) {
      setRatingMsg(err.message || 'No se pudo registrar la calificación')
      setMyRating(0)
    }
  }

  const handleDelete = async () => {
    setMenuOpen(false)
    if (!window.confirm('¿Eliminar esta alerta? Esta acción no se puede deshacer.')) return
    try {
      await deleteAlert(id)
      navigate('/home')
    } catch (err) {
      setActionMsg(err.message || 'No se pudo eliminar la alerta')
    }
  }

  const isAuthor = alert && alert.authorId && alert.authorId === currentUserId

  if (loading) {
    return (
      <div className='detail-page'>
        <DetailHeader onBack={() => navigate(-1)} />
        <div className='detail-loading'>
          <div className='detail-spinner' />
          <p>Cargando alerta...</p>
        </div>
      </div>
    )
  }

  if (error || !alert) {
    return (
      <div className='detail-page'>
        <DetailHeader onBack={() => navigate(-1)} />
        <div className='detail-error'>
          <p>{error || 'Alerta no encontrada'}</p>
          <button className='detail-retry-btn' onClick={() => navigate('/home')}>Volver a inicio</button>
        </div>
      </div>
    )
  }

  const category = CATEGORY_META[alert.category] || CATEGORY_META.OTROS
  const risk = RISK_META[(alert.riskType || '').toUpperCase()]
  const imageUrl = alert.image && typeof alert.image === 'object' ? alert.image.url : alert.image
  const hasImage = Boolean(imageUrl)
  const address = alert.location && typeof alert.location === 'object'
    ? (alert.location.address || 'Ubicación registrada')
    : (alert.location || 'Sin ubicación')

  return (
    <div className='detail-page'>
      <DetailHeader
        onBack={() => navigate(-1)}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((v) => !v)}
        onReport={handleReport}
        onDelete={isAuthor ? handleDelete : null}
      />

      <main className='detail-content'>
        <div className='detail-main-card'>
        <div className={`detail-hero ${hasImage ? '' : 'no-image'}`}>
          <img
            src={imageUrl || defaultAlert}
            alt={alert.title}
            className={`detail-hero-img ${hasImage ? '' : 'is-fallback'}`}
            onError={(e) => { e.target.onerror = null; e.target.src = defaultAlert; e.target.classList.add('is-fallback') }}
          />
        </div>

        <section className='detail-body'>
          <div className='detail-badges'>
            <span className='detail-cat-emoji' style={{ background: category.bg }}>{category.emoji}</span>
            <div className='detail-badges-col'>
              {risk && <span className={`detail-risk-badge ${risk.className}`}>{risk.label}</span>}
              <span className='detail-cat-label'>{category.label}</span>
            </div>
          </div>

          <h1 className='detail-title'>{alert.title}</h1>
          {alert.text && <p className='detail-desc'>{alert.text}</p>}

          <div className='detail-meta'>
            <span className='detail-meta-row'>
              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z' />
                <circle cx='12' cy='10' r='3' />
              </svg>
              <span>{address}</span>
              {distance && <span className='detail-distance'>• {distance}</span>}
            </span>
            <span className='detail-meta-row'>
              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <rect x='3' y='4' width='18' height='18' rx='2' />
                <path d='M16 2v4M8 2v4M3 10h18' />
              </svg>
              <span>{formatDate(alert.createdAt)}</span>
            </span>
          </div>

          <div className='detail-author'>
            <span className='detail-avatar'>{initials(resolveAuthorName(alert.authorId))}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className='detail-author-label'>Publicado por</span>
              <span className='detail-author-name'>{resolveAuthorName(alert.authorId)}</span>
            </div>
          </div>

          {authorReputation && (
            <div style={{ marginTop: '0.75rem' }}>
              <ReputationBadge reputation={authorReputation} ratingSummary={authorRatingSummary} />
            </div>
          )}

          {!isAuthor && currentUserId && (
            <div className='rep-rate-box'>
              <span className='rep-rate-title'>Califica al autor de esta alerta</span>
              <StarRating value={myRating} onRate={handleRate} size={28} />
              {ratingMsg && <span className='rep-rate-done'>{ratingMsg}</span>}
            </div>
          )}
        </section>
        </div>

        {verdict && verdict.verdict === 'CONFIRMED_FALSE' && (
          <div className='rep-verdict-banner rep-verdict-false'>
            🚫 Esta alerta fue confirmada como FALSA por la comunidad ({verdict.falseReportsCount} reportes).
          </div>
        )}
        {verdict && verdict.verdict === 'FLAGGED' && verdict.reportsCount > 0 && (
          <div className='rep-verdict-banner rep-verdict-flagged'>
            ⚠️ Esta alerta tiene {verdict.reportsCount} reporte{verdict.reportsCount === 1 ? '' : 's'} de la comunidad.
          </div>
        )}

        {actionMsg && <p className='detail-action-msg'>{actionMsg}</p>}

        <section className='detail-comments'>
          <h2 className='detail-comments-title'>
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z' />
            </svg>
            Comentarios ({comments.length})
          </h2>

          <form className='detail-comment-form' onSubmit={handleSubmitComment}>
            <textarea
              className='detail-comment-input'
              placeholder={currentUserId ? 'Añade un comentario...' : 'Inicia sesión para comentar'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value.slice(0, 500))}
              disabled={!currentUserId || submitting}
              rows={2}
            />
            <button
              type='submit'
              className='detail-comment-submit'
              disabled={!currentUserId || submitting || !newComment.trim()}
            >
              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <path d='m22 2-7 20-4-9-9-4Z' />
                <path d='M22 2 11 13' />
              </svg>
              {submitting ? 'Publicando...' : 'Publicar comentario'}
            </button>
            {commentError && <p className='detail-comment-error'>{commentError}</p>}
          </form>

          {commentsLoading ? (
            <div className='detail-comments-loading'>Cargando comentarios...</div>
          ) : comments.length === 0 ? (
            <p className='detail-comments-empty'>Sé el primero en comentar.</p>
          ) : (
            <ul className='detail-comments-list'>
              {comments.map((c) => {
                const name = resolveAuthorName(c.authorId)
                return (
                  <li key={c._id} className='detail-comment'>
                    <span className='detail-avatar sm'>{initials(name)}</span>
                    <div className='detail-comment-body'>
                      <div className='detail-comment-head'>
                        <span className='detail-comment-name'>{name}</span>
                        <span className='detail-comment-date'>{formatCommentDate(c.createdAt)}</span>
                      </div>
                      <p className='detail-comment-text'>{c.text}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>

      {showReportModal && (
        <ReportAlertModal
          postId={id}
          onClose={() => setShowReportModal(false)}
          onReported={handleReported}
        />
      )}
    </div>
  )
}

const DetailHeader = ({ onBack, menuOpen, onToggleMenu, onReport, onDelete }) => (
  <header className='detail-header'>
    <button className='detail-header-btn' onClick={onBack} aria-label='Regresar'>
      <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d='M15 18 9 12l6-6' />
      </svg>
    </button>
    <h1 className='detail-header-title'>Detalle de alerta</h1>
    {onToggleMenu ? (
      <div className='detail-menu-wrap'>
        <button className='detail-header-btn' onClick={onToggleMenu} aria-label='Más opciones'>
          <svg viewBox='0 0 24 24' fill='currentColor'>
            <circle cx='12' cy='5' r='2' /><circle cx='12' cy='12' r='2' /><circle cx='12' cy='19' r='2' />
          </svg>
        </button>
        {menuOpen && (
          <div className='detail-menu'>
            <button className='detail-menu-item' onClick={onReport}>Reportar alerta</button>
            {onDelete && (
              <button className='detail-menu-item danger' onClick={onDelete}>Eliminar alerta</button>
            )}
          </div>
        )}
      </div>
    ) : (
      <span className='detail-header-spacer' />
    )}
  </header>
)
