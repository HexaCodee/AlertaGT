const THEME_KEY = 'theme'

export const getTheme = () => window.localStorage.getItem(THEME_KEY) || 'dark'

export const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  window.localStorage.setItem(THEME_KEY, theme)
}

// Aplica el tema guardado al arrancar la app (antes del render para evitar parpadeo)
export const initTheme = () => applyTheme(getTheme())

export const toggleTheme = () => {
  const next = getTheme() === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}
