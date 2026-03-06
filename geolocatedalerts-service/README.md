# Geolocation Service

Servicio de geolocalización encargado de:
- Almacenar ubicaciones de usuarios
- Buscar usuarios dentro de un rango de distancia (2km)
- Obtener FCM tokens de usuarios cercanos para enviar notificaciones

## Stack

- **Node.js + Express**
- **MongoDB** (con índices geoespaciales 2dsphere)
- **Geoqueries** para búsquedas por proximidad

## Endpoints

### POST `/api/v1/locations`
Actualiza la ubicación de un usuario
```json
{
  "userId": "user-123",
  "latitude": -34.6037,
  "longitude": -58.3816,
  "address": "Av. Siempre Viva 123",
  "fcmToken": "token-firebase"
}
```

### GET `/api/v1/locations/nearby/users?latitude=-34.6037&longitude=-58.3816&maxDistance=2000`
Obtiene usuarios cercanos
- No requiere autenticación
- `maxDistance` en metros (default 2000 = 2km)

### GET `/api/v1/locations/nearby/tokens?latitude=-34.6037&longitude=-58.3816`
Obtiene FCM tokens de usuarios cercanos (para enviar notificaciones)
- No requiere autenticación

### GET `/api/v1/locations/my-location`
Obtiene la ubicación actual del usuario
- Requiere JWT

### PUT `/api/v1/locations/fcm-token`
Actualiza el FCM token del usuario
- Requiere JWT
```json
{
  "fcmToken": "nuevo-token"
}
```

### PUT `/api/v1/locations/inactive`
Marca usuario como inactivo
- Requiere JWT

### PUT `/api/v1/locations/active`
Marca usuario como activo
- Requiere JWT

### DELETE `/api/v1/locations`
Elimina la ubicación del usuario
- Requiere JWT

## Flujo de notificaciones

1. Usuario publica alerta en posts-service
2. Sistema obtiene ubicación de la alerta
3. Llamar a `/api/v1/locations/nearby/tokens` para obtener usuarios cercanos
4. Usar los FCM tokens para enviar notificaciones via notifications-service
5. Las notificaciones se guardan en la BD de notificaciones

## Notas

- Los índices geoespaciales de MongoDB requieren que `coordinates` esté en formato GeoJSON [longitude, latitude]
- El servicio no requiere autenticación para búsquedas de proximidad (público)
- Las operaciones que requieren autenticación necesitan validación con el servicio de Auth
