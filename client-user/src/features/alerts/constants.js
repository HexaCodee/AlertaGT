// client-user/src/features/alerts/constants.js
// Constantes de dominio de alertas y reportes (coinciden con los enums del backend).
// Emojis y colores calcados de client-admin (AlertFilters.jsx / AlertCard.jsx) para
// que las categorías se vean idénticas entre web y móvil.

export const CATEGORIES = [
  { value: 'ACCIDENTE', label: 'Accidente', icon: 'directions-car', emoji: '🚨', color: '#8b0000' },
  { value: 'TRAFICO', label: 'Tráfico', icon: 'traffic', emoji: '🚗', color: '#ef4444' },
  { value: 'PELIGRO', label: 'Peligro', icon: 'warning', emoji: '⚠️', color: '#f59e0b' },
  { value: 'OTROS', label: 'Otros', icon: 'campaign', emoji: '📌', color: '#6b7280' },
];

export const RISK_TYPES = [
  { value: 'LEVE', label: 'Leve' },
  { value: 'MODERADO', label: 'Moderado' },
  { value: 'GRAVE', label: 'Grave' },
];

// Motivos de reporte (deben coincidir con REPORT_REASONS del reputation-service).
export const REPORT_REASONS = [
  { value: 'FALSE_INFO', label: 'Información falsa' },
  { value: 'DUPLICATE', label: 'Alerta duplicada' },
  { value: 'RESOLVED', label: 'El incidente ya no existe' },
  { value: 'SPAM', label: 'Spam o publicidad' },
  { value: 'OFFENSIVE', label: 'Contenido ofensivo' },
  { value: 'OTHER', label: 'Otro motivo' },
];

export const categoryLabel = (value) =>
  CATEGORIES.find((c) => c.value === value)?.label || 'Otros';

export const categoryIcon = (value) =>
  CATEGORIES.find((c) => c.value === value)?.icon || 'campaign';

export const categoryEmoji = (value) =>
  CATEGORIES.find((c) => c.value === value)?.emoji || '📌';

export const categoryColor = (value) =>
  CATEGORIES.find((c) => c.value === value)?.color || '#6b7280';

export const RISK_META = {
  GRAVE: { label: 'Grave', color: '#dc2626' },
  MODERADO: { label: 'Moderado', color: '#d97706' },
  LEVE: { label: 'Leve', color: '#16a34a' },
};
