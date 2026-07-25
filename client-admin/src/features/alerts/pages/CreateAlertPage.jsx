import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../home/styles/home.css'
import '../styles/create-alert.css'

const POSTS_API_BASE = import.meta.env.VITE_POSTS_API_URL ?? 'http://localhost:3020/api/v1'
const DEFAULT_LOCATION_LABEL = 'Ciudad de Guatemala (Predeterminada)'
const DEFAULT_LATITUDE = 14.6168
const DEFAULT_LONGITUDE = -90.5133

// Límites geográficos aproximados de Guatemala (mismos valores que el backend,
// para no dejar publicar alertas fuera del país).
const GUATEMALA_BOUNDS = {
    MIN_LATITUDE: 13.73,
    MAX_LATITUDE: 17.81,
    MIN_LONGITUDE: -92.24,
    MAX_LONGITUDE: -88.22,
}

const isWithinGuatemala = (latitude, longitude) =>
    latitude >= GUATEMALA_BOUNDS.MIN_LATITUDE &&
    latitude <= GUATEMALA_BOUNDS.MAX_LATITUDE &&
    longitude >= GUATEMALA_BOUNDS.MIN_LONGITUDE &&
    longitude <= GUATEMALA_BOUNDS.MAX_LONGITUDE

// Umbral a partir del cual avisamos que la posición es poco confiable. En
// desktops sin GPS, el navegador suele resolver la ubicación por IP/red, con
// un margen de error de varios kilómetros — eso es lo que produce que la
// ubicación "caiga" en un punto genérico que no es la ubicación real del
// usuario (no es un bug de AlertaGT, es una limitación del método del navegador).
const LOW_ACCURACY_THRESHOLD_METERS = 5000

const formatAccuracyNote = (accuracy) => {
    if (accuracy == null || !Number.isFinite(accuracy) || accuracy <= LOW_ACCURACY_THRESHOLD_METERS) return ''
    const km = (accuracy / 1000).toFixed(1)
    return ` · precisión baja (±${km} km, puede no ser tu ubicación exacta)`
}

const CATEGORY_OPTIONS = [
    { id: 'accident', label: 'Accidente', icon: '🚗' },
    { id: 'traffic', label: 'Tráfico', icon: '🚦' },
    { id: 'danger', label: 'Peligro', icon: '⚠️' },
    { id: 'other', label: 'Otros', icon: '📣' }
]

const RISK_OPTIONS = [
    {
        id: 'low',
        title: 'Leve',
        description: 'Situación de bajo riesgo'
    },
    {
        id: 'medium',
        title: 'Moderado',
        description: 'Situación que requiere precaución'
    },
    {
        id: 'high',
        title: 'Grave',
        description: 'Situación crítica que requiere atención inmediata'
    }
]

const CATEGORY_TO_API = {
    accident: 'ACCIDENTE',
    traffic: 'TRAFICO',
    danger: 'PELIGRO',
    other: 'OTROS'
}

const RISK_TO_API = {
    low: 'LEVE',
    medium: 'MODERADO',
    high: 'GRAVE'
}

const MAX_TITLE = 100
const MAX_DESCRIPTION = 500

export const CreateAlertPage = () => {
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [riskType, setriskType] = useState('')
    const [locationLabel, setLocationLabel] = useState(DEFAULT_LOCATION_LABEL)
    const [currentCoordinates, setCurrentCoordinates] = useState({
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE
    })
    const [isOutsideGuatemala, setIsOutsideGuatemala] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [attachmentNames, setAttachmentNames] = useState([])
    const [submitMessage, setSubmitMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const applyCoordinates = (latitude, longitude, label, accuracy = null) => {
        setCurrentCoordinates({ latitude, longitude })
        setIsOutsideGuatemala(!isWithinGuatemala(latitude, longitude))
        setLocationLabel(
            isWithinGuatemala(latitude, longitude)
                ? `${label}${formatAccuracyNote(accuracy)}`
                : 'Ubicación fuera de Guatemala: no se puede publicar'
        )
    }

    const refreshCurrentLocation = () => {
    const savedLat = window.sessionStorage.getItem('user_lat')
    const savedLng = window.sessionStorage.getItem('user_lng')

    if (!navigator.geolocation) {
        if (savedLat && savedLng) {
            applyCoordinates(parseFloat(savedLat), parseFloat(savedLng), 'Ubicación de la sesión')
        } else {
            applyCoordinates(DEFAULT_LATITUDE, DEFAULT_LONGITUDE, DEFAULT_LOCATION_LABEL)
        }
        return
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords
            applyCoordinates(latitude, longitude, 'Coordenadas GPS detectadas', accuracy)
        },
        () => {
            if (savedLat && savedLng) {
                applyCoordinates(parseFloat(savedLat), parseFloat(savedLng), 'Ubicación de la sesión (Sensor previo)')
            } else {
                applyCoordinates(DEFAULT_LATITUDE, DEFAULT_LONGITUDE, DEFAULT_LOCATION_LABEL)
            }
        },
        {
            enableHighAccuracy: true
        }
    )
}

    useEffect(() => {
        refreshCurrentLocation()
    }, [])

    const canPublish = useMemo(() => {
        return (
            title.trim().length > 0 &&
            description.trim().length > 0 &&
            category.length > 0 &&
            riskType.length > 0 &&
            Boolean(currentCoordinates) &&
            !isOutsideGuatemala
        )
    }, [category, currentCoordinates, description, isOutsideGuatemala, riskType, title])

    const buildLocationPayload = () => {
        return {
            latitude: currentCoordinates?.latitude ?? DEFAULT_LATITUDE,
            longitude: currentCoordinates?.longitude ?? DEFAULT_LONGITUDE,
            address: locationLabel
        }
    }

    const parseResponsePayload = async (response) => {
        const text = await response.text()

        if (!text) {
            return null
        }

        try {
            return JSON.parse(text)
        } catch {
            return text
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (isOutsideGuatemala) {
            setSubmitMessage('No puedes publicar alertas fuera de Guatemala.')
            return
        }

        if (!canPublish) {
            setSubmitMessage('Completa los campos obligatorios antes de publicar.')
            return
        }

        const token = window.localStorage.getItem('authToken') || window.localStorage.getItem('token')

        if (!token) {
            setSubmitMessage('Debes iniciar sesión para publicar una alerta.')
            return
        }

        const locationPayload = buildLocationPayload()
        const formData = new FormData()

        // Campos de texto obligatorios
        formData.append('title', title.trim())
        formData.append('category', CATEGORY_TO_API[category])
        formData.append('riskType', RISK_TO_API[riskType])
        formData.append('text', description.trim())
        formData.append('isPublished', 'true')
        formData.append('moderation.status', 'APPROVED')

        if (locationPayload) {
            formData.append('location', JSON.stringify(locationPayload))
        }

        if (selectedImage) {
            formData.append('image', selectedImage)
        }

        attachmentNames.forEach((fileName) => {
            const file = fileName instanceof File ? fileName : null

            if (file) {
                formData.append('attachments', file)
            }
        })

        try {
            setIsSubmitting(true)
            setSubmitMessage('')

            const response = await fetch(`${POSTS_API_BASE.replace(/\/+$/, '')}/posts`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                },
                body: formData
            })

            const payload = await parseResponsePayload(response)

            if (!response.ok) {
                let apiMessage = payload?.message || payload?.error || 'No se pudo publicar la alerta.'
                if (payload?.errors && Array.isArray(payload.errors) && payload.errors.length > 0) {
                    const detailedErrors = payload.errors.map(err => err.message).join(' | ');
                    apiMessage = `${apiMessage}: ${detailedErrors}`; 
                }

                throw new Error(apiMessage)
            }

            setSubmitMessage('Alerta publicada correctamente.')
            navigate('/home')
        } catch (error) {
            setSubmitMessage(error.message || 'No se pudo conectar con el servicio de publicaciones.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleImageChange = (event) => {
        const file = event.target.files?.[0]
        setSelectedImage(file ?? null)
    }

    const handleAttachmentChange = (event) => {
        const files = Array.from(event.target.files ?? [])
        setAttachmentNames(files)
    }

    return (
        <div className='create-alert-page'>
            <header className='create-alert-header'>
                <button
                    type='button'
                    className='header-back-button'
                    aria-label='Regresar'
                    onClick={() => navigate('/home')}
                >
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <path d='M15 18 9 12l6-6' />
                    </svg>
                </button>
                <h1>Crear alerta</h1>
                <span className='header-spacer' aria-hidden='true' />
            </header>

            <main className='create-alert-content'>
                <form className='create-alert-form' onSubmit={handleSubmit}>
                    <section className='field-block'>
                        <label htmlFor='alert-title' className='section-label'>
                            Título de la alerta <span>*</span>
                        </label>
                        <input
                            id='alert-title'
                            type='text'
                            value={title}
                            onChange={(event) => setTitle(event.target.value.slice(0, MAX_TITLE))}
                            placeholder='Ej: Accidente en Calzada Roosevelt'
                            className='text-input'
                        />
                        <p className='counter-text'>{title.length}/{MAX_TITLE} caracteres</p>
                    </section>

                    <section className='field-block'>
                        <p className='section-label'>
                            Categoría <span>*</span>
                        </p>
                        <div className='category-grid'>
                            {CATEGORY_OPTIONS.map((option) => {
                                const selected = category === option.id

                                return (
                                    <label key={option.id} className={`selection-card ${selected ? 'selected' : ''}`}>
                                        <input
                                            type='radio'
                                            name='category'
                                            value={option.id}
                                            checked={selected}
                                            onChange={() => setCategory(option.id)}
                                        />
                                        <span className='selection-icon' aria-hidden='true'>{option.icon}</span>
                                        <span className='selection-label'>{option.label}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </section>

                    <section className='field-block'>
                        <p className='section-label'>
                            Nivel de riesgo <span>*</span>
                        </p>
                        <div className='risk-list'>
                            {RISK_OPTIONS.map((risk) => {
                                const selected = riskType === risk.id

                                return (
                                    <label key={risk.id} className={`risk-card ${selected ? 'selected' : ''}`}>
                                        <input
                                            type='radio'
                                            name='risk-level'
                                            value={risk.id}
                                            checked={selected}
                                            onChange={() => setriskType(risk.id)}
                                        />
                                        <span className='risk-text'>
                                            <strong>{risk.title}</strong>
                                            <small>{risk.description}</small>
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                    </section>

                    <section className='field-block'>
                        <label htmlFor='alert-description' className='section-label'>
                            Descripción <span>*</span>
                        </label>
                        <textarea
                            id='alert-description'
                            value={description}
                            onChange={(event) => setDescription(event.target.value.slice(0, MAX_DESCRIPTION))}
                            placeholder='Describe lo que está sucediendo...'
                            className='text-area'
                        />
                        <p className='counter-text'>{description.length}/{MAX_DESCRIPTION} caracteres</p>
                    </section>

                    <section className='field-block'>
                        <p className='section-label'>
                            Ubicación <span>*</span>
                        </p>

                        <div className={`location-current ${isOutsideGuatemala ? 'location-current--error' : ''}`}>
                            <span className='location-pin' aria-hidden='true'>{isOutsideGuatemala ? '🚫' : '📍'}</span>
                            <div>
                                <strong>Usar mi ubicación actual</strong>
                                <small>{locationLabel}</small>
                            </div>
                        </div>

                        {isOutsideGuatemala && (
                            <p className='location-warning'>
                                AlertaGT solo permite publicar alertas dentro de Guatemala. Verifica tu ubicación o GPS.
                            </p>
                        )}

                        <button
                            type='button'
                            className='location-action-button'
                            onClick={refreshCurrentLocation}
                        >
                            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                <path d='m21 3-8 18-2.5-7.5L3 11l18-8Z' />
                            </svg>
                            Actualizar coordenadas GPS
                        </button>
                    </section>

                    <section className='field-block'>
                        <p className='section-label'>Imagen (opcional)</p>
                        <label className='upload-box'>
                            <input type='file' accept='image/*' onChange={handleImageChange} />
                            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                <path d='M12 3v12' />
                                <path d='m7 8 5-5 5 5' />
                                <path d='M5 14v4a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-4' />
                            </svg>
                            <span>Subir imagen</span>
                            {selectedImage && <small>{selectedImage.name}</small>}
                        </label>
                    </section>

                    <section className='field-block'>
                        <p className='section-label'>Archivos adjuntos (opcional)</p>
                        <label className='attachment-button'>
                            <input type='file' multiple onChange={handleAttachmentChange} />
                            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                <path d='m21.44 11.05-8.49 8.49a6 6 0 0 1-8.48-8.48l9.19-9.2a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.82-2.82l8.48-8.49' />
                            </svg>
                            <span>{attachmentNames.length > 0 ? `${attachmentNames.length} archivo(s)` : 'Adjuntar archivo'}</span>
                        </label>
                    </section>

                    <button type='submit' className='publish-button' disabled={!canPublish || isSubmitting}>
                        {isSubmitting ? 'Publicando...' : 'Publicar alerta'}
                    </button>

                    <p className='publish-hint'>Al publicar, aceptas que esta información será visible para la comunidad</p>
                    {submitMessage && <p className='submit-message'>{submitMessage}</p>}
                </form>
            </main>

            <nav className='bottom-nav' aria-label='Navegación principal'>
                <button type='button' className='bottom-nav-item' onClick={() => navigate('/home')}>
                    <span className='bottom-nav-icon'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                            <path d='M12 3.2 3 10.6V21a1 1 0 0 0 1 1h5.5a1 1 0 0 0 1-1v-5.2h3V21a1 1 0 0 0 1 1H20a1 1 0 0 0 1-1V10.6l-9-7.4Z' />
                        </svg>
                    </span>
                    <span className='bottom-nav-label'>Inicio</span>
                </button>
                <button type='button' className='bottom-nav-item' onClick={() => navigate('/map')}>
                    <span className='bottom-nav-icon'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                            <path d='M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3' />
                            <path d='M9 3v15' />
                            <path d='M15 6v15' />
                        </svg>
                    </span>
                    <span className='bottom-nav-label'>Mapa</span>
                </button>
                <button type='button' className='bottom-nav-item active' aria-pressed='true'>
                    <span className='bottom-nav-icon'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                            <path d='M12 5v14M5 12h14' />
                            <circle cx='12' cy='12' r='10' />
                        </svg>
                    </span>
                    <span className='bottom-nav-label'>Crear</span>
                </button>
                <button type='button' className='bottom-nav-item' onClick={() => navigate('/notifications')}>
                    <span className='bottom-nav-icon'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                            <path d='M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V10a5 5 0 0 1 10 0v4.2c0 .5.2 1 .6 1.4L19 17h-4' />
                            <path d='M10 20a2 2 0 0 0 4 0' />
                        </svg>
                    </span>
                    <span className='bottom-nav-label'>Notificaciones</span>
                </button>
                <button type='button' className='bottom-nav-item' onClick={() => navigate('/profile')}>
                    <span className='bottom-nav-icon'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                            <circle cx='12' cy='8' r='4' />
                            <path d='M4 21a8 8 0 0 1 16 0' />
                        </svg>
                    </span>
                    <span className='bottom-nav-label'>Cuenta</span>
                </button>
            </nav>
        </div>
    )
}