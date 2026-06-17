import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCard } from '../components/AlertCard'
import { AlertFilters } from '../components/AlertFilters'
import '../styles/home.css'

const GEOLOCATION_API_BASE = import.meta.env.VITE_GEOLOCATION_API_URL ?? 'http://localhost:3022/api/v1'
const POSTS_API_BASE = import.meta.env.VITE_POSTS_API_URL ?? 'http://localhost:3020/api/v1'

export const HomePage = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('distance')
  const [activeNav, setActiveNav] = useState('home')
  const [locationText, setLocationText] = useState('Cargando ubicación...')
  const [locationStatus, setLocationStatus] = useState('')
  
  const [realAlerts, setRealAlerts] = useState([])
  const [loadingAlerts, setLoadingAlerts] = useState(true)

  useEffect(() => {
    const token = window.localStorage.getItem('authToken') || window.localStorage.getItem('token')
    if (!token) {
      setLocationText('Ubicación activa • Zona 10, Guatemala')
      setLocationStatus('Inicia sesión para leer la ubicación guardada')
      return
    }

    const controller = new AbortController()
    const loadLocation = async () => {
      try {
        const [locationResponse, statusResponse] = await Promise.all([
          fetch(`${GEOLOCATION_API_BASE}/locations/my-location`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            signal: controller.signal
          }),
          fetch(`${GEOLOCATION_API_BASE}/locations/status`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            signal: controller.signal
          })
        ])

        if (locationResponse.ok) {
          const result = await locationResponse.json()
          const location = result?.data ?? {}
          setLocationText(location.address || 'Ubicación guardada')
          setLocationStatus(location.latitude && location.longitude ? `${Number(location.latitude).toFixed(4)}, ${Number(location.longitude).toFixed(4)}` : '')
          return
        }

        if (statusResponse.ok) {
          const result = await statusResponse.json()
          const status = result?.data ?? {}
          setLocationText(status.isActive ? 'Ubicación activa' : 'Ubicación inactiva')
          setLocationStatus(status.lastUpdate ? `Última actualización: ${new Date(status.lastUpdate).toLocaleString('es-GT')}` : '')
          return
        }
      } catch {
        setLocationText('Ubicación activa • Zona 10, Guatemala')
        setLocationStatus('Error en el servicio de geolocalización')
      }
    }

    loadLocation()
    return () => controller.abort()
  }, [])

  const fetchAlerts = useCallback(async () => {
    setLoadingAlerts(true)
    try {
      const response = await fetch(`${POSTS_API_BASE}/posts`, {
        headers: { Accept: 'application/json' }
      })
      if (response.ok) {
        const data = await response.json()
        const rawAlerts = Array.isArray(data) ? data : data.data || []
        
        const formattedAlerts = rawAlerts.map(alert => ({
          ...alert,
          id: alert._id, 
          date: alert.createdAt,
          location: alert.location && typeof alert.location === 'object' 
            ? alert.location.address || 'Ubicación desconocida' 
            : alert.location || 'Sin ubicación'
        }))
        
        setRealAlerts(formattedAlerts)
      }
    } catch (error) {
      console.error('Error conectando a posts-service:', error)
    } finally {
      setLoadingAlerts(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const filteredAlerts = useMemo(() => {
    let filtered = [...realAlerts]
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(alert => alert.category === selectedCategory)
    }
    if (sortBy === 'distance') {
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    }
    return filtered
  }, [realAlerts, selectedCategory, sortBy])

  const handleCategoryChange = useCallback(category => setSelectedCategory(category), [])
  const handleSortChange = useCallback(sort => setSortBy(sort), [])

  const navItems = [
    { id: 'home', label: 'Inicio', icon: <svg viewBox='0 0 24 24' fill='currentColor'><path d='M12 3.2 3 10.6V21a1 1 0 0 0 1 1h5.5a1 1 0 0 0 1-1v-5.2h3V21a1 1 0 0 0 1 1H20a1 1 0 0 0 1-1V10.6l-9-7.4Z' /></svg> },
    { id: 'map', label: 'Mapa', icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3M9 3v15M15 6v15' /></svg> },
    { id: 'create', label: 'Crear', icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 5v14M5 12h14' /><circle cx='12' cy='12' r='10' /></svg> },
    { id: 'notifications', label: 'Notificaciones', icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V10a5 5 0 0 1 10 0v4.2c0 .5.2 1 .6 1.4L19 17h-4M10 20a2 2 0 0 0 4 0' /></svg> },
    { id: 'account', label: 'Cuenta', icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='8' r='4' /><path d='M4 21a8 8 0 0 1 16 0' /></svg> }
  ]

  return (
    <div className='home-container' role='main'>
      <section className='top-panel'>
        <header className='home-header'>
          <div className='header-content'>
            <div className='location-info'>
              <div>
                <h1 className='app-title'>AlertaGT</h1>
                <div className='location-box' aria-live='polite'>
                  <span className='location-box-title'>Ubicación activa</span>
                  <span className='location-text'>{locationText}</span>
                  {locationStatus && <span className='location-status'>{locationStatus}</span>}
                </div>
              </div>
            </div>
            <button onClick={fetchAlerts} className='refresh-button' aria-label='Actualizar alertas'>
              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15' /></svg>
            </button>
          </div>
          <div className='filter-label-row'>
            <svg className='filter-icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M4 6h16M4 12h16M4 18h16' /></svg>
            <span className='filter-text'>Filtrar por:</span>
          </div>
        </header>

        <AlertFilters selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} sortBy={sortBy} onSortChange={handleSortChange} />
      </section>

      <main className='alerts-container'>
        {loadingAlerts ? (
          <div className='no-alerts'><p>Cargando alertas desde el servidor...</p></div>
        ) : (
          <>
            <div className='alerts-count'>
              <span>{filteredAlerts.length} alertas</span>
              {selectedCategory !== 'all' && (
                <button className='clear-filter' onClick={() => handleCategoryChange('all')}>Limpiar filtro</button>
              )}
            </div>

            <div className='alerts-list'>
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
              ) : (
                <div className='no-alerts'>
                  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='12' r='10' /><path d='M12 6v6m0 4v.01' /></svg>
                  <p>No hay alertas disponibles</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <nav className='bottom-nav' aria-label='Navegación principal'>
        {navItems.map((item) => {
          const isActive = activeNav === item.id
          return (
            <button key={item.id} type='button' className={`bottom-nav-item ${isActive ? 'active' : ''}`} aria-pressed={isActive} onClick={() => item.id === 'create' ? navigate('/alerts/create') : setActiveNav(item.id)}>
              <span className='bottom-nav-icon'>{item.icon}</span>
              <span className='bottom-nav-label'>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}