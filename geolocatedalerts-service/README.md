# Geolocation Service

Servicio de geolocalización para AlertaGT, responsable de almacenar ubicación de usuarios y buscar proximidad para notificaciones.

## Qué hace

- Guarda la ubicación de usuarios autenticados
- Proporciona búsquedas geoespaciales de usuarios y tokens FCM cercanos
- Permite activar/desactivar el envío de notificaciones por usuario
- Documentación Swagger disponible en `/api-docs`

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- Swagger (swagger-jsdoc + swagger-ui-express)

## Uso rápido

```bash
cd geolocatedalerts-service
pnpm install
pnpm start
```

Para desarrollo:

```bash
pnpm dev
```

La API corre por defecto en `http://localhost:3022` y la documentación está en `http://localhost:3022/api-docs`.

## Variables de entorno

Crea un archivo `.env` con estos valores:

```env
PORT=3022
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=AlertaGT_Geo
AUTH_SERVICE_URL=http://localhost:3010/api/v1
SERVICE_TOKEN=your-service-token
RATE_LIMIT_REQUESTS_PER_MINUTE=100
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

## Endpoints principales

- `POST /api/v1/locations` — Actualiza o crea ubicación de usuario
- `GET /api/v1/locations/nearby/users` — Obtiene usuarios cercanos sin autenticación
- `GET /api/v1/locations/nearby/tokens` — Obtiene tokens FCM cercanos sin autenticación
- `GET /api/v1/locations/my-location` — Recupera ubicación actual del usuario (JWT requerido)
- `PUT /api/v1/locations/fcm-token` — Actualiza token FCM del usuario (JWT requerido)
- `PUT /api/v1/locations/inactive` — Marca usuario como inactivo (JWT requerido)
- `PUT /api/v1/locations/active` — Marca usuario como activo (JWT requerido)
- `DELETE /api/v1/locations` — Elimina ubicación de usuario (JWT requerido)
- `PUT /api/v1/locations/toggle-sharing` — Cambia estado de compartición de ubicación
- `GET /api/v1/locations/status` — Consulta estado de ubicación y disponibilidad

## Flujo de notificaciones

1. `posts-service` crea una alerta con ubicación
2. Se consultan usuarios cercanos via `geolocatedalerts-service`
3. Se obtienen tokens FCM para notificaciones locales
4. `notifications-service` envía los mensajes push

## Notas

- Las coordenadas deben enviarse en GeoJSON: `[longitude, latitude]`
- Búsquedas por proximidad usan índices geoespaciales `2dsphere` en MongoDB
- La ruta `/nearby` es pública; sólo las rutas de perfil requieren JWT
- Swagger se genera desde los comentarios JSDoc en `src/locations/*.routes.js`