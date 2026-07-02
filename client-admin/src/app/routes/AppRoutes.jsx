import { Routes, Route } from 'react-router-dom'
import { HomePage } from '../../features/home/pages/HomePage.jsx'
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx'
import { RegisterPage } from '../../features/auth/pages/RegisterPage.jsx'
import { CreateAlertPage } from '../../features/alerts/pages/CreateAlertPage.jsx'
import { AlertDetailPage } from '../../features/alerts/pages/AlertDetailPage.jsx'
import { AccountPage } from '../../features/profile/pages/AccountPage.jsx'
import { NotificationsPage } from '../../features/notifications/pages/NotificationsPage.jsx'
import { MapPage } from '../../features/map/pages/MapPage.jsx'
import { TermsOfServicePage } from '../../features/legal/pages/TermsOfServicePage.jsx'
import { PrivacyPolicyPage } from '../../features/legal/pages/PrivacyPolicyPage.jsx'

export const AppRoutes = () => (
  <Routes>
    <Route path='/' element={<AuthPage />} />
    <Route path='/home' element={<HomePage />} />
    <Route path='/alerts/create' element={<CreateAlertPage />} />
    <Route path='/alerts/:id' element={<AlertDetailPage />} />
    <Route path='/register' element={<RegisterPage />} />
    <Route path='/profile' element={<AccountPage />} />
    <Route path='/notifications' element={<NotificationsPage />} />
    <Route path='/map' element={<MapPage />} />
    <Route path='/terms' element={<TermsOfServicePage />} />
    <Route path='/privacy' element={<PrivacyPolicyPage />} />
  </Routes>
)
