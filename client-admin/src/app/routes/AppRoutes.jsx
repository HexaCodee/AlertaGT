import { Routes, Route } from 'react-router-dom'
import { HomePage } from '../../features/home/pages/HomePage.jsx'
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx'
import { RegisterPage } from '../../features/auth/pages/RegisterPage.jsx'
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx'
import { CreateAlertPage } from '../../features/alerts/pages/CreateAlertPage.jsx'
import { AlertDetailPage } from '../../features/alerts/pages/AlertDetailPage.jsx'
import { AccountPage } from '../../features/profile/pages/AccountPage.jsx'
import { NotificationsPage } from '../../features/notifications/pages/NotificationsPage.jsx'
import { MapPage } from '../../features/map/pages/MapPage.jsx'
import { TermsOfServicePage } from '../../features/legal/pages/TermsOfServicePage.jsx'
import { PrivacyPolicyPage } from '../../features/legal/pages/PrivacyPolicyPage.jsx'
import { AdminPage } from '../../features/admin/pages/AdminPage.jsx'

export const AppRoutes = () => (
  <Routes>
    <Route path='/' element={<AuthPage />} />
    <Route path='/home' element={<HomePage />} />
    <Route path='/alerts/create' element={<CreateAlertPage />} />
    <Route path='/alerts/:id' element={<AlertDetailPage />} />
    <Route path='/register' element={<RegisterPage />} />
    <Route path='/verify-email' element={<VerifyEmailPage />} />
    <Route path='/profile' element={<AccountPage />} />
    <Route path='/notifications' element={<NotificationsPage />} />
    <Route path='/map' element={<MapPage />} />
    {/* El propio AdminPage valida el rol del JWT y muestra acceso restringido
        si la cuenta no es de administración. */}
    <Route path='/admin' element={<AdminPage />} />
    <Route path='/terms' element={<TermsOfServicePage />} />
    <Route path='/privacy' element={<PrivacyPolicyPage />} />
  </Routes>
)
