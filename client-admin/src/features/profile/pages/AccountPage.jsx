import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfileData } from '../services/profileService';
import defaultAvatar from '../../../assets/img/defaultAvatar.svg';
import '../../home/styles/home.css';
import '../styles/account.css';

export const AccountPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProfileData()
            .then(setData)
            .catch((err) => console.error("Error cargando perfil:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="profile-spinner"></div>
                <p style={{ fontWeight: 500, fontSize: '1rem', color: '#555' }}>Cargando perfil...</p>
            </div>
        );
    }

    if (!data) return <div className="error">No se pudo cargar la información.</div>;

    const { profile, stats } = data;

    const navItems = [
        { id: 'home', label: 'Inicio', icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 3.2 3 10.6V21a1 1 0 0 0 1 1h5.5a1 1 0 0 0 1-1v-5.2h3V21a1 1 0 0 0 1 1H20a1 1 0 0 0 1-1V10.6l-9-7.4Z' /></svg> },
        { id: 'map', label: 'Mapa', icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3M9 3v15M15 6v15' /></svg> },
        { id: 'create', label: 'Crear', icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 5v14M5 12h14' /><circle cx='12' cy='12' r='10' /></svg> },
        { id: 'notifications', label: 'Notificaciones', icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V10a5 5 0 0 1 10 0v4.2c0 .5.2 1 .6 1.4L19 17h-4M10 20a2 2 0 0 0 4 0' /></svg> },
        { id: 'profile', label: 'Cuenta', icon: <svg viewBox='0 0 24 24' fill='currentColor'><circle cx='12' cy='8' r='4' /><path d='M4 21a8 8 0 0 1 16 0' /></svg> }
    ];

    return (
        <div className="account-container-replica">
            {/* Cabecera Roja */}
            <header className="header-red-banner">
                <img src={profile.profilePicture || defaultAvatar} alt="Perfil" className="header-avatar" onError={(e) => { e.target.src = defaultAvatar; }} />
                <div className="header-user-info">
                    <h1 className="header-name">{profile.name} {profile.surname}</h1>
                    <p className="header-username">@{profile.username}</p>
                    <span className="header-badge">✓ Verificado</span>
                </div>
            </header>

            {/* Tarjeta de Estadísticas (superpuesta) */}
            <section className="stats-card-overlay">
                <div className="stat-column">
                    <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <h3 className="stat-number">{stats.totalAlerts}</h3>
                    <p className="stat-label">Alertas publicadas</p>
                </div>
                <div className="stat-column">
                    <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <h3 className="stat-number">{stats.totalComments}</h3>
                    <p className="stat-label">Comentarios</p>
                </div>
                <div className="stat-column">
                    <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                    </svg>
                    <h3 className="stat-number">{stats.communityHelped}</h3>
                    <p className="stat-label">Comunidad ayudada</p>
                </div>
            </section>

            {/* Información de Contacto */}
            <section className="contact-info-card">
                <h3 className="section-title">Información de contacto</h3>
                <div className="contact-row">
                    <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 4l10 8 10-8"/></svg>
                    <div className="contact-text">
                        <span className="contact-label">Email</span>
                        <span className="contact-value">{profile.email}</span>
                    </div>
                </div>
                <div className="contact-row">
                    <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                    <div className="contact-text">
                        <span className="contact-label">Teléfono</span>
                        <span className="contact-value">{profile.phone || '+502 0000-0000'}</span>
                    </div>
                </div>
            </section>

            {/* Lista de Opciones */}
            <section className="options-list-card">
                <div className="option-item">
                    <svg className="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span className="option-name">Estado de ubicación</span>
                    <span className="option-arrow">›</span>
                </div>
                <div className="option-item">
                    <svg className="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    <span className="option-name">Preferencias de notificaciones</span>
                    <span className="badge-coming-soon">Próximamente</span>
                    <span className="option-arrow">›</span>
                </div>
                <div className="option-item">
                    <svg className="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6"/></svg>
                    <span className="option-name">Mi impacto en la comunidad</span>
                    <span className="badge-coming-soon">Próximamente</span>
                    <span className="option-arrow">›</span>
                </div>
                <div className="option-item border-none">
                    <svg className="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <span className="option-name">Configuración</span>
                    <span className="option-arrow">›</span>
                </div>
            </section>

            {/* Botón Cerrar Sesión */}
            <button className="logout-btn" onClick={() => {
                window.localStorage.removeItem('authToken');
                window.localStorage.removeItem('token');
                window.sessionStorage.clear();
                navigate('/');
            }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                Cerrar sesión
            </button>

            {/* Versión */}
            <div className="app-footer-info">
                <p>AlertaGT v1.0.0</p>
                <p>Tu comunidad más segura</p>
            </div>

            {/* Barra de navegación inferior INTACTA */}
            <nav className='bottom-nav' aria-label='Navegación principal' style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
                {navItems.map((item) => {
                    const isActive = item.id === 'profile';
                    return (
                        <button key={item.id} type='button' className={`bottom-nav-item ${isActive ? 'active' : ''}`} aria-pressed={isActive} onClick={() => {
                            if (item.id === 'home') {
                                navigate('/home');
                            } else if (item.id === 'create') {
                                navigate('/alerts/create');
                            } else if (item.id === 'profile') {
                                // ya estamos en profile
                            }
                        }}>
                            <span className='bottom-nav-icon'>{item.icon}</span>
                            <span className='bottom-nav-label'>{item.label}</span>
                        </button>
                    )
                })}
            </nav>
        </div>
    );
};