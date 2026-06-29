import { Routes, Route } from 'react-router-dom'
import { HomePage } from '../../features/home/pages/HomePage.jsx'
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx'
import { RegisterPage } from '../../features/auth/pages/RegisterPage.jsx'
import { CreateAlertPage } from '../../features/alerts/pages/CreateAlertPage.jsx'
import { DashboardPage } from '../../shared/components/layout/DashboardPage.jsx'
import { AccountPage } from '../../features/profile/pages/AccountPage.jsx'

export const AppRoutes = () => (
  <Routes>
    <Route path='/' element={<AuthPage />} />
    <Route path='/home' element={<HomePage />} />
    <Route path='/alerts/create' element={<CreateAlertPage />} />
    <Route path='/register' element={<RegisterPage />} />
    <Route path='/dashboard' element={<DashboardPage />} />
    <Route path='/profile' element={<AccountPage />} />
  </Routes>
)
