import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/create-alert.css'

const POSTS_API_BASE = import.meta.env.VITE_POSTS_API_URL ?? 'http://localhost:3020/api/v1'
const DEFAULT_LOCATION_LABEL = 'Zona 10, Guatemala'
const DEFAULT_LATITUDE = 14.6168
const DEFAULT_LONGITUDE = -90.5133

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
    const [riskLevel, setRiskLevel] = useState('')
    const [useCurrentLocation, setUseCurrentLocation] = useState(true)
    const [manualAddress, setManualAddress] = useState('')
    const [locationLabel, setLocationLabel] = useState(DEFAULT_LOCATION_LABEL)
    const [currentCoordinates, setCurrentCoordinates] = useState({
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE
    })
    const [selectedImage, setSelectedImage] = useState(null)
    const [attachmentNames, setAttachmentNames] = useState([])
    const [submitMessage, setSubmitMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const refreshCurrentLocation = () => {
        if (!navigator.geolocation) {
            setCurrentCoordinates({ latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE })
            setLocationLabel(DEFAULT_LOCATION_LABEL)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setCurrentCoordinates({ latitude, longitude })
                setLocationLabel(DEFAULT_LOCATION_LABEL)
            },
            () => {
                setCurrentCoordinates({ latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE })
                setLocationLabel(DEFAULT_LOCATION_LABEL)
            },
            {
                enableHighAccuracy: true,
                timeout: 7000
            }
        )
    }

    useEffect(() => {
        if (useCurrentLocation) {
            refreshCurrentLocation()
            return
        }

        setCurrentCoordinates(null)
        setLocationLabel(DEFAULT_LOCATION_LABEL)
    }, [useCurrentLocation])

    const canPublish = useMemo(() => {
        const hasLocation = useCurrentLocation
            ? Boolean(currentCoordinates)
            : manualAddress.trim().length > 0

        return (
            title.trim().length > 0 &&
            description.trim().length > 0 &&
            category.length > 0 &&
            riskLevel.length > 0 &&
            hasLocation
        )
    }, [category, currentCoordinates, description, manualAddress, riskLevel, title, useCurrentLocation])

    const buildLocationPayload = () => {
        if (useCurrentLocation) {
            return {
                latitude: currentCoordinates?.latitude ?? DEFAULT_LATITUDE,
                longitude: currentCoordinates?.longitude ?? DEFAULT_LONGITUDE,
                address: locationLabel
            }
        }

        const trimmedAddress = manualAddress.trim()

        if (!trimmedAddress) {
            return null
        }

        return {
            address: trimmedAddress,
            manual: true
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

        formData.append('title', title.trim())
        formData.append('category', CATEGORY_TO_API[category])
        formData.append('riskType', RISK_TO_API[riskLevel])
        formData.append('text', description.trim())

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
                const apiMessage = payload?.message || payload?.error || 'No se pudo publicar la alerta.'
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
                                const selected = riskLevel === risk.id

                                return (
                                    <label key={risk.id} className={`risk-card ${selected ? 'selected' : ''}`}>
                                        <input
                                            type='radio'
                                            name='risk-level'
                                            value={risk.id}
                                            checked={selected}
                                            onChange={() => setRiskLevel(risk.id)}
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
                        <div className='location-header'>
                            <p className='section-label'>
                                Ubicación <span>*</span>
                            </p>
                            <label className='switch' aria-label='Usar mi ubicación actual'>
                                <input
                                    type='checkbox'
                                    checked={useCurrentLocation}
                                    onChange={(event) => setUseCurrentLocation(event.target.checked)}
                                />
                                <span className='slider' />
                            </label>
                        </div>

                        <div className='location-current'>
                            <span className='location-pin' aria-hidden='true'>📍</span>
                            <div>
                                <strong>Usar mi ubicación actual</strong>
                                <small>{locationLabel}</small>
                            </div>
                        </div>

                        {!useCurrentLocation && (
                            <>
                                <label htmlFor='manual-address' className='sub-label'>Dirección manual</label>
                                <input
                                    id='manual-address'
                                    type='text'
                                    value={manualAddress}
                                    onChange={(event) => setManualAddress(event.target.value)}
                                    placeholder='Ingresa la dirección'
                                    className='text-input'
                                />
                            </>
                        )}

                        <button
                            type='button'
                            className='location-action-button'
                            onClick={refreshCurrentLocation}
                        >
                            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                <path d='m21 3-8 18-2.5-7.5L3 11l18-8Z' />
                            </svg>
                            Usar ubicación actual
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

            <nav className='create-bottom-nav' aria-label='Navegación principal'>
                <button type='button' className='create-bottom-nav-item' onClick={() => navigate('/home')}>
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <path d='M12 3.2 3 10.6V21a1 1 0 0 0 1 1h5.5a1 1 0 0 0 1-1v-5.2h3V21a1 1 0 0 0 1 1H20a1 1 0 0 0 1-1V10.6l-9-7.4Z' />
                    </svg>
                    <span>Inicio</span>
                </button>
                <button type='button' className='create-bottom-nav-item'>
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <path d='M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3' />
                        <path d='M9 3v15' />
                        <path d='M15 6v15' />
                    </svg>
                    <span>Mapa</span>
                </button>
                <button type='button' className='create-bottom-nav-item active' aria-current='page'>
                    <span className='create-dot' aria-hidden='true' />
                    <span>Crear</span>
                </button>
                <button type='button' className='create-bottom-nav-item'>
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <path d='M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V10a5 5 0 0 1 10 0v4.2c0 .5.2 1 .6 1.4L19 17h-4' />
                        <path d='M10 20a2 2 0 0 0 4 0' />
                    </svg>
                    <span>Notificaciones</span>
                </button>
                <button type='button' className='create-bottom-nav-item'>
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <circle cx='12' cy='8' r='4' />
                        <path d='M4 21a8 8 0 0 1 16 0' />
                    </svg>
                    <span>Cuenta</span>
                </button>
            </nav>
        </div>
    )
}