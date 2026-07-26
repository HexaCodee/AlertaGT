import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getNearbyAlerts } from '../services/mapService'
import { getTheme } from '../../../shared/utils/theme.js'
import { getAlertRadius } from '../../../shared/utils/preferences.js'
import '../../home/styles/home.css'
import '../styles/map.css'

// Centro por defecto: Ciudad de Guatemala
const DEFAULT_CENTER = { lat: 14.6349, lng: -90.5069 }

const CATEGORY = {
  ACCIDENTE: { color: '#8b0000', emoji: '🚗' },
  TRAFICO:   { color: '#ef4444', emoji: '🚦' },
  PELIGRO:   { color: '#f59e0b', emoji: '⚠️' },
  OTROS:     { color: '#6b7280', emoji: '📣' },
}

// Tiles gratuitos de OpenStreetMap (claro) y CartoDB (oscuro) — sin API key
const TILES = {
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
}

const alertIcon = (color, emoji) =>
  L.divIcon({
    className: 'map-alert-pin',
    html: `
      <div class="map-alert-pin__wrap">
        <svg class="map-alert-pin__svg" viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 22 12 22s12-13.5 12-22C24 5.373 18.627 0 12 0z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        </svg>
        <span class="map-alert-pin__glyph">${emoji}</span>
      </div>`,
    iconSize: [34, 46],
    iconAnchor: [17, 46],
    popupAnchor: [0, -40],
  })

const userIcon = L.divIcon({
  className: 'map-user-icon',
  html: '<span class="map-user-dot"><span class="map-user-pulse"></span></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const NAV_ITEMS = [
  { id: 'home', label: 'Inicio', icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 3.2 3 10.6V21a1 1 0 0 0 1 1h5.5a1 1 0 0 0 1-1v-5.2h3V21a1 1 0 0 0 1 1H20a1 1 0 0 0 1-1V10.6l-9-7.4Z' /></svg> },
  { id: 'map', label: 'Mapa', icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3M9 3v15M15 6v15' /></svg> },
  { id: 'create', label: 'Crear', icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 5v14M5 12h14' /><circle cx='12' cy='12' r='10' /></svg> },
  { id: 'notifications', label: 'Notificaciones', icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V10a5 5 0 0 1 10 0v4.2c0 .5.2 1 .6 1.4L19 17h-4M10 20a2 2 0 0 0 4 0' /></svg> },
  { id: 'profile', label: 'Cuenta', icon: <svg viewBox='0 0 24 24' fill='currentColor'><circle cx='12' cy='8' r='4' /><path d='M4 21a8 8 0 0 1 16 0' /></svg> },
]

// Ubicación guardada en la sesión (la deja Home) — para marcar el punto al instante
const positionFromSession = () => {
  const savedLat = window.sessionStorage.getItem('user_lat')
  const savedLng = window.sessionStorage.getItem('user_lng')
  return savedLat && savedLng ? { lat: parseFloat(savedLat), lng: parseFloat(savedLng) } : null
}

const getUserPosition = () =>
  new Promise((resolve) => {
    const fallback = positionFromSession()
    if (!navigator.geolocation) { resolve(fallback); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.sessionStorage.setItem('user_lat', pos.coords.latitude)
        window.sessionStorage.setItem('user_lng', pos.coords.longitude)
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => resolve(fallback),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  })

// Distancia aproximada en metros entre dos puntos (fórmula haversine)
const distanceMeters = (a, b) => {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s1 = Math.sin(dLat / 2) ** 2
    + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s1))
}

export const MapPage = () => {
  const navigate = useNavigate()
  const mapRef = useRef(null)
  // Arranca con la ubicación de sesión (si existe) para mostrar el punto de inmediato
  const [userPos, setUserPos] = useState(positionFromSession)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isDark = getTheme() === 'dark'
  const tiles = isDark ? TILES.dark : TILES.light

  const lastFetchedPos = useRef(null)

  const fetchAlertsAt = useCallback(async (center) => {
    try {
      const data = await getNearbyAlerts({ latitude: center.lat, longitude: center.lng, maxDistance: getAlertRadius() })
      setAlerts(data)
    } catch (err) {
      setError(err.message || 'Error cargando alertas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    let watchId = null

    const start = async () => {
      const pos = await getUserPosition()
      if (ignore) return
      setUserPos(pos)
      lastFetchedPos.current = pos
      await fetchAlertsAt(pos || DEFAULT_CENTER)
      if (ignore || !navigator.geolocation) return

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const next = { lat: position.coords.latitude, lng: position.coords.longitude }
          setUserPos(next)
          window.sessionStorage.setItem('user_lat', next.lat)
          window.sessionStorage.setItem('user_lng', next.lng)
          if (!lastFetchedPos.current || distanceMeters(lastFetchedPos.current, next) >= 15) {
            lastFetchedPos.current = next
            fetchAlertsAt(next)
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 0 },
      )
    }

    start()

    return () => {
      ignore = true
      if (watchId != null) navigator.geolocation.clearWatch(watchId)
    }
  }, [fetchAlertsAt])

  // Centra el mapa una sola vez, cuando llega la primera ubicación del usuario
  const hasCentered = useRef(false)
  useEffect(() => {
    if (userPos && mapRef.current && !hasCentered.current) {
      hasCentered.current = true
      mapRef.current.setView([userPos.lat, userPos.lng], 15)
    }
  }, [userPos])

  const handleRecenter = () => {
    if (userPos && mapRef.current) mapRef.current.flyTo([userPos.lat, userPos.lng], 15)
  }

  const navHandler = (id) => {
    if (id === 'home') navigate('/home')
    else if (id === 'create') navigate('/alerts/create')
    else if (id === 'notifications') navigate('/notifications')
    else if (id === 'profile') navigate('/profile')
  }

  const center = userPos || DEFAULT_CENTER

  return (
    <div className='map-page'>
      <header className='map-header'>
        <button className='map-header-btn' onClick={() => navigate('/home')} aria-label='Regresar'>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M15 18 9 12l6-6' /></svg>
        </button>
        <h1 className='map-header-title'>Mapa de alertas</h1>
        <span className='map-header-count'>{alerts.length}</span>
      </header>

      <div className='map-canvas'>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={14}
          zoomControl={false}
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url={tiles.url} attribution={tiles.attribution} />

          {userPos && <Marker position={[userPos.lat, userPos.lng]} icon={userIcon} />}

          {alerts.map((alert) => {
            const meta = CATEGORY[alert.category] || CATEGORY.OTROS
            return (
              <Marker
                key={alert.id}
                position={[alert.latitude, alert.longitude]}
                icon={alertIcon(meta.color, meta.emoji)}
                eventHandlers={{ click: () => navigate(`/alerts/${alert.id}`) }}
              />
            )
          })}
        </MapContainer>

        <button className='map-recenter-btn' onClick={handleRecenter} aria-label='Centrar en mi ubicación' disabled={!userPos}>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <circle cx='12' cy='12' r='3' />
            <path d='M12 2v3M12 19v3M2 12h3M19 12h3' />
          </svg>
        </button>

        {loading && (
          <div className='map-loading'><div className='map-spinner' /><span>Cargando alertas...</span></div>
        )}
        {error && <div className='map-error'>{error}</div>}
      </div>

      <nav className='bottom-nav' aria-label='Navegación principal' style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type='button'
            className={`bottom-nav-item ${item.id === 'map' ? 'active' : ''}`}
            aria-pressed={item.id === 'map'}
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
