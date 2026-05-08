import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes.jsx'

export const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
)
