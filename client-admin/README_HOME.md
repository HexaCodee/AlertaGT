# AlertaGT - Frontend (Client Admin)

Página principal rápida y optimizada de AlertaGT sin conexión al backend.

## 📁 Estructura de Directorios

```
src/
├── app/
│   ├── routes/
│   │   └── AppRoutes.jsx          # Definición de rutas
│   └── App.jsx                     # Componente principal
├── features/
│   └── home/
│       ├── pages/
│       │   └── HomePage.jsx        # Página principal
│       ├── components/
│       │   ├── AlertCard.jsx       # Tarjeta de alerta (memoized)
│       │   └── AlertFilters.jsx    # Panel de filtros
│       ├── data/
│       │   └── mockAlerts.js       # Datos de ejemplo
│       └── styles/
│           └── home.css             # Estilos específicos
├── shared/
│   ├── components/
│   │   └── layout/
│   │       └── DashboardPage.jsx   # Dashboard
│   ├── hooks/
│   │   ├── useCustom.js            # Hooks personalizados
│   │   └── useAsync.js             # Hooks para async
│   └── utils/
│       ├── performance.js          # Utilidades de rendimiento
│       └── lazyLoad.jsx             # Componentes lazy loading
└── styles/
    ├── index.css                   # Estilos globales
    └── loading.css                 # Estilos de carga
```

## 🚀 Características

### Performance Optimizado
- ✅ Componentes memoizados con `React.memo()`
- ✅ Lazy loading de imágenes con `loading="lazy"`
- ✅ Debouncing en búsqueda (300ms)
- ✅ Contenimiento de estilos con CSS containment
- ✅ Grid responsive con CSS Grid
- ✅ Gradientes optimizados

### Funcionalidades
- 🔍 Búsqueda en tiempo real (debounced)
- 📁 Filtrado por categorías
- 📊 Ordenamiento por distancia o fecha
- 📱 Completamente responsive
- ♿ Accesibilidad mejorada (ARIA labels)
- 🎨 Tema oscuro moderno

### Categorías de Alertas
- 🚗 Tráfico
- 💥 Accidentes
- 🏗️ Construcción
- 🌧️ Clima
- 🎉 Eventos
- 📢 Otros

## 🎯 Uso

### Página Principal
```jsx
import { HomePage } from './features/home/pages/HomePage'

// Ya está en las rutas como '/'
```

### Datos de Ejemplo
Los datos se encuentran en `src/features/home/data/mockAlerts.js`. Se utilizarán como placeholder hasta conectar con el backend.

### Agregar Nueva Alerta de Ejemplo
```javascript
{
  id: 7,
  title: 'Título de la alerta',
  description: 'Descripción detallada',
  category: 'traffic', // traffic, accident, construction, weather, event, other
  location: 'Ubicación específica',
  distance: 500, // en metros
  reportedBy: 'Nombre del usuario',
  date: new Date(),
  image: 'URL de la imagen'
}
```

## 🛠️ Optimizaciones Implementadas

### CSS Containment
```css
.alert-image {
  contain: layout style paint;
}
```

### Image Lazy Loading
```jsx
<img
  src={url}
  loading="lazy"
  alt={title}
/>
```

### Memoización
```jsx
const AlertCard = memo(({ alert }) => {
  // Component
}, (prevProps, nextProps) => {
  return prevProps.alert.id === nextProps.alert.id
})
```

### Debouncing en Búsqueda
```javascript
const debounce = (func, wait) => {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
```

## 📊 Rutas Disponibles

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/` | HomePage | ✅ Completada |
| `/auth` | AuthPage | ⏳ Existente |
| `/register` | RegisterPage | ⏳ Existente |
| `/dashboard` | DashboardPage | ⏳ Existente |

## 🔄 Próximos Pasos

1. **Conectar al Backend**
   - Reemplazar `mockAlerts` con llamadas a API
   - Implementar autenticación
   - Sincronización en tiempo real

2. **Mejoras de Interacción**
   - Detalles completos de alertas
   - Crear nuevas alertas
   - Comentarios en alertas
   - Sistema de notificaciones

3. **Análisis**
   - Google Analytics
   - Tracking de eventos
   - Performance monitoring

## 🎨 Sistema de Colores

```css
--primary: #ef4444        /* Rojo AlertaGT */
--primary-dark: #dc2626   /* Rojo más oscuro */
--primary-light: #fca5a5  /* Rojo más claro */
--bg-primary: #0f172a     /* Fondo oscuro */
--bg-secondary: #1e293b   /* Fondo secundario */
```

## 📦 Dependencias

- React 18+
- React Router v6
- CSS 3 (Grid, Gradients, Containment)

## 🚦 Rendimiento

**Métricas esperadas:**
- FCP: < 1s
- LCP: < 2s
- CLS: < 0.1
- TTI: < 3s

## 📝 Notas

- Todos los datos son mock hasta conectar al backend
- Las imágenes se cargan desde Unsplash (con lazy loading)
- El componente está optimizado para cargar rápidamente
- Se utilizan media queries para mobile-first design
