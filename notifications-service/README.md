# Notifications Service

Servicio de notificaciones push basado en Firebase Cloud Messaging (FCM) para la aplicación AlertsPosts.

## Características

- ✅ Notificaciones en tiempo real via FCM
- ✅ Gestión de notificaciones (crear, marcar leídas, eliminar)
- ✅ Suscripción a tópicos para notificaciones masivas
- ✅ MongoDB para almacenamiento de historial
- ✅ Autenticación con JWT

## Stack

- **Node.js + Express**
- **MongoDB** (Mongoose)
- **Firebase Cloud Messaging (FCM)**
- **cors, helmet, morgan**

## Endpoints

Todos requieren autenticación con JWT en el header: `Authorization: Bearer <token>`

### GET `/api/v1/notifications`
Lista notificaciones del usuario
- Query params: `page=1`, `limit=20`, `unread=true|false`

### GET `/api/v1/notifications/:id`
Obtiene una notificación por ID

### PUT `/api/v1/notifications/:id/read`
Marca una notificación como leída

### PUT `/api/v1/notifications/read-all`
Marca todas las notificaciones como leídas

### DELETE `/api/v1/notifications/:id`
Elimina una notificación

### DELETE `/api/v1/notifications`
Elimina todas las notificaciones del usuario

## Integración con Posts Service

Cuando se crea una publicación en posts-service:

1. Se obtiene la ubicación del postProcedimiento
2. Se buscan usuarios dentro de 2km (via location-service)
3. Se obtienen sus FCM tokens (almacenados en auth-service)
4. Se crean registros de notificación
5. Se envían push notifications via FCM

## Estructura

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
├── package.json
└── .env.example
```

## Notas

- El middleware de validación JWT es un placeholder. Debe conectarse con Auth Service para validar tokens reales.
- Los FCM tokens deben ser enviados por la app móvil cuando el usuario se autentica.
- Las notificaciones se almacenan en MongoDB para historial y auditoría.
