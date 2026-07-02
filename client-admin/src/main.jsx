import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './styles/loading.css'
import './styles/theme.css'
import { App } from './app/App.jsx'
import { initTheme } from './shared/utils/theme.js'

initTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

