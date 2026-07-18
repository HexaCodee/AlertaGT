// client-user/src/shared/constants/theme.js
// Única fuente de verdad para colores, espaciados, tamaños de fuente y sombras.
// NO hardcodear colores fuera de este archivo.
//
// Dos paletas (oscura/clara) calcadas de client-admin (web): DARK_COLORS copia
// el modo oscuro real (mismos fondos #0f141b/#1a212b/#212a36, mismos textos
// #e6e8eb/#aab2bd/#7b828d) y LIGHT_COLORS copia los valores por defecto (sin
// data-theme) de esas mismas pantallas. El rojo de acento (#ef4444) es igual
// en ambos temas. Para leer el tema activo en un componente, usar useTheme()
// (client-user/src/shared/context/ThemeContext.jsx) en vez de importar COLORS
// directamente.

import { Platform } from 'react-native';

export const DARK_COLORS = {
  primary: '#ef4444',       // rojo de acento (chips activos, nav activo, CTA) — igual que web
  primaryStrong: '#dc2626', // extremo del gradiente rojo de web (category-button.active)
  secondary: '#7b828d',     // gris "dark-text-muted" de web (íconos/labels inactivos)
  background: '#0f141b',    // "--dark-bg" de web
  surface: '#1a212b',       // "--dark-surface" de web (tarjetas)
  surfaceAlt: '#212a36',    // "--dark-surface-2" de web (chips, inputs)
  headerSurface: '#141b24', // fondo del panel superior en home.css dark mode
  text: '#e6e8eb',          // "--dark-text"
  textLight: '#aab2bd',     // "--dark-text-2"
  textMuted: '#7b828d',     // "--dark-text-muted"
  error: '#dc2626',
  success: '#16a34a',
  warning: '#f59e0b',
  border: 'rgba(255, 255, 255, 0.08)', // "--dark-border"
  // Banner de estado de ubicación (calcado de .location-box en modo oscuro)
  locationBg: 'rgba(239, 68, 68, 0.14)',
  locationBorder: 'rgba(239, 68, 68, 0.35)',
  locationTitle: '#fca5a5',
  locationText: '#fecaca',
};

export const LIGHT_COLORS = {
  primary: '#ef4444',
  primaryStrong: '#dc2626',
  secondary: '#64748b',     // gris de íconos/labels inactivos en modo claro (web)
  background: '#f9fafb',    // fondo de página en modo claro (home.css)
  surface: '#ffffff',       // tarjetas/paneles en modo claro
  surfaceAlt: '#f8fafc',    // chips, inputs en modo claro
  headerSurface: '#ffffff',
  text: '#0f172a',
  textLight: '#475569',
  textMuted: '#94a3b8',
  error: '#dc2626',
  success: '#16a34a',
  warning: '#f59e0b',
  border: '#e5e7eb',
  // Banner de estado de ubicación (calcado de .location-box en modo claro)
  locationBg: '#fff1f2',
  locationBorder: 'rgba(239, 68, 68, 0.25)',
  locationTitle: '#991b1b',
  locationText: '#b91c1c',
};

// Compat: paleta por defecto para código que aún no consume useTheme().
export const COLORS = DARK_COLORS;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

// En web, react-native-web deprecó las props shadow* en favor de `boxShadow`.
// En iOS/Android seguimos usando shadow*/elevation (comportamiento nativo intacto).
export const SHADOWS = {
  // Sombra suave para tarjetas y superficies elevadas.
  card: Platform.select({
    web: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 3,
    },
  }),
  // Sombra más marcada para modales o botones flotantes.
  elevated: Platform.select({
    web: { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)' },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 8,
    },
  }),
};

export default { COLORS, DARK_COLORS, LIGHT_COLORS, SPACING, FONT_SIZE, SHADOWS };
