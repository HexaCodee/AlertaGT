# Notifications Service

Servicio de notificaciones push para AlertaGT, construido con Node.js, Express y la Expo Push API.

## Qué hace

- Envía notificaciones push vía Expo Push API
- Guarda historial de notificaciones en MongoDB
- Permite marcar notificaciones como leídas
- Elimina notificaciones individuales o todas
- Documentación Swagger disponible en `/api-docs`

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- Expo Push API (vía axios, sin credenciales)
- Swagger (swagger-jsdoc + swagger-ui-express)

## Uso rápido

```bash
cd notifications-service
pnpm install
pnpm start
```

Para desarrollo:

```bash
pnpm dev
```

La API corre por defecto en `http://localhost:3021` y la documentación en `http://localhost:3021/api-docs`.

## Variables de entorno

Crea un archivo `.env` con los valores necesarios:

```env
PORT=3021
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=AlertaGT_Notifications
AUTH_SERVICE_URL=http://localhost:3010/api/v1
SERVICE_TOKEN=your-service-token
RATE_LIMIT_REQUESTS_PER_MINUTE=100
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

## Endpoints principales

- `GET /api/v1/notifications` — Lista notificaciones del usuario
  - Query params: `page`, `limit`, `unread`
- `GET /api/v1/notifications/:id` — Detalle de notificación
- `PUT /api/v1/notifications/:id/read` — Marca una notificación como leída
- `PUT /api/v1/notifications/read-all` — Marca todas como leídas
- `DELETE /api/v1/notifications/:id` — Elimina una notificación
- `DELETE /api/v1/notifications` — Elimina todas las notificaciones del usuario

### Seguridad

- Requiere header `Authorization: Bearer <token>` para la mayoría de endpoints
- El servicio también usa `x-service-token` para validación de llamadas internas

## Integración

El flujo típico es:

1. `posts-service` crea una alerta o publicación
2. `geolocatedalerts-service` obtiene usuarios/push tokens de Expo cercanos
3. `notifications-service` crea registros de notificación
4. Se envían mensajes push a los tokens de Expo vía Expo Push API

## Estructura de la aplicación

```
notifications-service/
├── configs/
│   ├── app.js
│   ├── db.configuration.js
│   ├── cors.configuration.js
│   └── helmet.configuration.js
├── src/
│   ├── notifications/
│   │   ├── notification.model.js
│   │   ├── notification.service.js
│   │   ├── notification.controller.js
│   │   └── notification.routes.js
│   └── expo-push/
│       └── expo-push.service.js
├── middlewares/
│   └── validate-JWT.js
├── index.js
└── package.json
```

## Notas

- La Expo Push API no requiere credenciales para el volumen de esta app.
- El servicio necesita acceso a la base de datos MongoDB.
- La documentación Swagger se genera a partir de las anotaciones JSDoc en `*.routes.js`.

