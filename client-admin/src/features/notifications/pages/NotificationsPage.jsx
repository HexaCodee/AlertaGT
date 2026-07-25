import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../services/notificationService'
import { getAlertRadius } from '../../../shared/utils/preferences.js'
import '../../home/styles/home.css'
import '../styles/notifications.css'

const NAV_ITEMS = [
  {
    id: 'home', label: 'Inicio',
    icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 3.2 3 10.6V21a1 1 0 0 0 1 1h5.5a1 1 0 0 0 1-1v-5.2h3V21a1 1 0 0 0 1 1H20a1 1 0 0 0 1-1V10.6l-9-7.4Z' /></svg>,
  },
  {
    id: 'map', label: 'Mapa',
    icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3M9 3v15M15 6v15' /></svg>,
  },
  {
    id: 'create', label: 'Crear',
    icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 5v14M5 12h14' /><circle cx='12' cy='12' r='10' /></svg>,
  },
  {
    id: 'notifications', label: 'Notificaciones',
    icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V10a5 5 0 0 1 10 0v4.2c0 .5.2 1 .6 1.4L19 17h-4M10 20a2 2 0 0 0 4 0' /></svg>,
  },
  {
    id: 'profile', label: 'Cuenta',
    icon: <svg viewBox='0 0 24 24' fill='currentColor'><circle cx='12' cy='8' r='4' /><path d='M4 21a8 8 0 0 1 16 0' /></svg>,
  },
]

// Emoji por categoría de alerta (viene en notif.data.category)
const CATEGORY_EMOJI = {
  ACCIDENTE: { emoji: '🚗', bg: '#fff3e0', label: 'Accidente' },
  TRAFICO:   { emoji: '🚦', bg: '#e3f2fd', label: 'Tráfico' },
  PELIGRO:   { emoji: '⚠️', bg: '#fff8e1', label: 'Peligro' },
  OTROS:     { emoji: '📣', bg: '#f3e5f5', label: 'Otros' },
}

// Emoji fallback por tipo de notificación
const TYPE_META = {
  NEW_ALERT:             { emoji: '🔔', bg: '#fff0f0', label: 'Nueva alerta' },
  NEARBY_ALERT_CRITICAL: { emoji: '🚨', bg: '#fff0f0', label: 'Alerta crítica' },
  NEW_COMMENT:           { emoji: '💬', bg: '#eff6ff', label: 'Nuevo comentario' },
  MODERATION:            { emoji: '🛡️', bg: '#f0fdf4', label: 'Moderación' },
  FLAGGED:               { emoji: '🚩', bg: '#fef2f2', label: 'Reportada' },
  SYSTEM:                { emoji: '⚙️', bg: '#f8fafc', label: 'Sistema' },
  LOCATION_SHARED:       { emoji: '📍', bg: '#fefce8', label: 'Ubicación' },
  LOCATION_DISABLED:     { emoji: '📵', bg: '#f8fafc', label: 'Ubicación desactivada' },
}

const getNotifIcon = (notif) => {
  // Para alertas, prioriza el emoji de la categoría de la alerta
  const isAlert = notif.type === 'NEW_ALERT' || notif.type === 'NEARBY_ALERT_CRITICAL'
  const category = notif.data?.category
  if (isAlert && category && CATEGORY_EMOJI[category]) {
    return CATEGORY_EMOJI[category]
  }
  return TYPE_META[notif.type] ?? TYPE_META.SYSTEM
}

const formatDistance = (meters) => {
  if (meters == null || Number.isNaN(Number(meters))) return null
  const m = Math.round(Number(meters))
  if (m < 1000) return `a ${m} m`
  return `a ${(m / 1000).toFixed(1)} km`
}

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return 'Hace un momento'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  return d.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })
}

export const NotificationsPage = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const load = useCallback((position) => {
    fetchNotifications({ latitude: position?.latitude, longitude: position?.longitude })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? [])
        setNotifications(list)
      })
      .catch((err) => console.error('Error cargando notificaciones:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      load(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => load({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => load(null),
      // enableHighAccuracy + maximumAge:0: evita que el navegador resuelva la
      // posición por IP/red (baja precisión, puede quedar lejos de la real)
      // o reuse una posición vieja en caché.
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  }, [load])

  // Respeta el radio global: oculta notificaciones de alertas fuera del rango.
  // Las que no tienen distancia (no son de proximidad) siempre se muestran.
  const radius = getAlertRadius()
  const withinRadius = notifications.filter((n) => {
    const d = n.data?.distance
    return d == null || Number(d) <= radius
  })

  const displayed = tab === 'unread'
    ? withinRadius.filter((n) => !n.read)
    : withinRadius

  const unreadCount = withinRadius.filter((n) => !n.read).length

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAll = async () => {
    try {
      await markAllAsRead()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications()
      setNotifications([])
    } catch (err) {
      console.error(err)
    }
  }

  const navHandler = (id) => {
    if (id === 'home') navigate('/home')
    else if (id === 'create') navigate('/alerts/create')
    else if (id === 'profile') navigate('/profile')
    else if (id === 'map') navigate('/map')
  }

  return (
    <div className='notifications-container'>
      {/* Header */}
      <header className='notifications-header'>
        <div className='notifications-header-top'>
          <div className='notifications-title-block'>
            <h1 className='notifications-title'>Notificaciones</h1>
            <span className='notifications-unread-badge'>{unreadCount} sin leer</span>
          </div>
          <div className='notifications-header-actions'>
            <button
              className='btn-mark-all'
              onClick={handleMarkAll}
              disabled={unreadCount === 0}
              style={{ opacity: unreadCount === 0 ? 0.5 : 1 }}
            >
              Marcar todas
            </button>
            <button className='btn-delete-all' onClick={handleDeleteAll} title='Eliminar todas' disabled={notifications.length === 0} style={{ opacity: notifications.length === 0 ? 0.5 : 1 }}>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <polyline points='3 6 5 6 21 6' />
                <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' />
                <path d='M10 11v6M14 11v6' />
                <path d='M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2' />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className='notifications-tabs'>
        <button
          className={`tab-btn ${tab === 'all' ? 'active' : ''}`}
          onClick={() => setTab('all')}
        >
          Todas ({notifications.length})
        </button>
        <button
          className={`tab-btn ${tab === 'unread' ? 'active' : ''}`}
          onClick={() => setTab('unread')}
        >
          No leídas ({unreadCount})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className='notifications-loading'>
          <div className='notif-spinner' />
          <p>Cargando notificaciones...</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className='notifications-empty'>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
            <path d='M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V10a5 5 0 0 1 10 0v4.2c0 .5.2 1 .6 1.4L19 17h-4M10 20a2 2 0 0 0 4 0' />
          </svg>
          <p>{tab === 'unread' ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones'}</p>
        </div>
      ) : (
        <ul className='notifications-list' style={{ listStyle: 'none', margin: 0, padding: '0.75rem' }}>
          {displayed.map((notif) => {
            const icon = getNotifIcon(notif)
            const distance = formatDistance(notif.data?.distance)
            return (
              <li key={notif._id}>
                <div className={`notification-card ${notif.read ? '' : 'unread'}`}>
                  <div className='notification-icon-wrap' style={{ background: icon.bg }}>
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{icon.emoji}</span>
                    <span className='notification-icon-label'>{icon.label}</span>
                  </div>
                  <div className='notification-body'>
                    <p className='notification-title'>{notif.title}</p>
                    {notif.body && <p className='notification-text'>{notif.body}</p>}
                    <div className='notification-meta'>
                      <span className='notification-date'>{formatDate(notif.createdAt)}</span>
                      {distance && (
                        <span className='notification-distance'>
                          <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                            <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z' />
                            <circle cx='12' cy='10' r='3' />
                          </svg>
                          {distance}
                        </span>
                      )}
                    </div>
                    <div className='notification-actions'>
                      {!notif.read && (
                        <button className='btn-action-link' onClick={() => handleMarkRead(notif._id)}>
                          Marcar como leída
                        </button>
                      )}
                      <button className='btn-action-link delete' onClick={() => handleDelete(notif._id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                  {!notif.read && <span className='unread-dot' />}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Bottom Nav */}
      <nav className='bottom-nav' aria-label='Navegación principal' style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type='button'
            className={`bottom-nav-item ${item.id === 'notifications' ? 'active' : ''}`}
            aria-pressed={item.id === 'notifications'}
            onClick={() => navHandler(item.id)}
          >
            <span className='bottom-nav-icon'>{item.icon}</span>
            <span className='bottom-nav-label'>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
