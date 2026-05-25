# Notifications Service

Servicio de notificaciones push para AlertaGT, construido con Node.js, Express y Firebase Cloud Messaging.

## Qué hace

- Envía notificaciones push via FCM
- Guarda historial de notificaciones en MongoDB
- Permite marcar notificaciones como leídas
- Elimina notificaciones individuales o todas
- Documentación Swagger disponible en `/api-docs`

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- Firebase Admin SDK
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
FIREBASE_SERVICE_ACCOUNT_PATH=./alertagt-notifications-firebase-adminsdk-fbsvc-0361af1299.json
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
2. `geolocatedalerts-service` obtiene usuarios/FCM tokens cercanos
3. `notifications-service` crea registros de notificación
4. Se envían mensajes push a los tokens FCM

## Estructura de la aplicación

```
notifications-service/
├── configs/
│   ├── app.js
│   ├── db.configuration.js
│   ├── cors.configuration.js
│   ├── helmet.configuration.js
│   └── firebase.configuration.js
├── src/
│   ├── notifications/
│   │   ├── notification.model.js
│   │   ├── notification.service.js
│   │   ├── notification.controller.js
│   │   └── notification.routes.js
│   └── fcm/
│       └── fcm.service.js
├── middlewares/
│   └── validate-JWT.js
├── index.js
└── package.json
```

## Notas

- Asegura que `FIREBASE_SERVICE_ACCOUNT_PATH` apunte a un archivo JSON válido.
- El servicio necesita acceso a la base de datos MongoDB.
- La documentación Swagger se genera a partir de las anotaciones JSDoc en `*.routes.js`.

