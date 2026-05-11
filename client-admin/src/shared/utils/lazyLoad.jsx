import { lazy, Suspense } from 'react'

// Lazy load pages para mejor performance
export const HomePage = lazy(() => import('../../features/home/pages/HomePage.jsx'))
export const AuthPage = lazy(() => import('../../features/auth/pages/AuthPage.jsx'))
export const RegisterPage = lazy(() => import('../../features/auth/pages/RegisterPage.jsx'))
export const DashboardPage = lazy(() => import('../../shared/components/layout/DashboardPage.jsx'))

export const LoadingFallback = () => (
  <div className='loading-fallback'>
    <div className='spinner'></div>
    <p>Cargando...</p>
  </div>
)

export const withSuspense = (Component) => (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component {...props} />
  </Suspense>
)
