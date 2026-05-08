import { Routes, Route } from 'react-router-dom'
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx'
import { RegisterPage } from '../../features/auth/pages/RegisterPage.jsx'
import { DashboardPage } from '../../shared/components/layout/DashboardPage.jsx'

export const AppRoutes = () => (
  <Routes>
    <Route path='/' element={<AuthPage />} />
    <Route path='/register' element={<RegisterPage />} />
    <Route path='/dashboard' element={<DashboardPage />} />
  </Routes>
)
