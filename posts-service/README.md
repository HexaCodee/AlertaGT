# Posts Service

Servicio de publicaciones y comentarios para AlertaGT, construido con Node.js y Express.

## Características

- ✅ Creación, edición y eliminación de publicaciones
- ✅ Sistema de comentarios en publicaciones
- ✅ Moderación de contenido
- ✅ Búsqueda geoespacial de publicaciones cercanas
- ✅ Integración con Cloudinary para imágenes
- ✅ Validación de archivos y contenido
- ✅ Manejo centralizado de errores

## Stack Tecnológico

- **Node.js 18+**
- **Express.js**
- **MongoDB** con índices geoespaciales
- **Mongoose** para modelado de datos
- **Cloudinary** para gestión de imágenes
- **Multer** para subida de archivos
- **Express-validator** para validaciones

## Arquitectura

```
posts-service/
├── configs/
│   ├── app.js              # Configuración principal
│   ├── db.configuration.js # Conexión MongoDB
│   └── cloudinary.config.js # Config Cloudinary
├── src/
│   ├── posts/
│   │   ├── post.model.js   # Modelo Mongoose
│   │   ├── post.service.js # Lógica de negocio
│   │   ├── post.controller.js # Controladores
│   │   └── post.routes.js  # Rutas Express
│   └── comments/
│       ├── comment.model.js
│       ├── comment.service.js
│       ├── comment.controller.js
│       └── comment.routes.js
├── middlewares/
│   ├── validate-JWT.js     # Validación JWT
│   ├── upload.js           # Config Multer
│   ├── post.validator.js   # Validaciones posts
│   └── comment.validator.js # Validaciones comments
└── scripts/
    ├── create-indexes.js   # Migraciones índices
    └── seed-data.js        # Datos de prueba
```

## Endpoints Principales

### Publicaciones
- `GET /api/v1/posts` - Lista de publicaciones
- `GET /api/v1/posts/:id` - Obtener publicación por ID
- `GET /api/v1/posts/proximity/search` - Búsqueda por proximidad
- `POST /api/v1/posts` - Crear publicación (JWT requerido)
- `PUT /api/v1/posts/:id` - Actualizar publicación (autor)
- `DELETE /api/v1/posts/:id` - Eliminar publicación (autor)

### Comentarios
- `GET /api/v1/comments/post/:postId` - Comentarios de una publicación
- `POST /api/v1/comments` - Crear comentario (JWT requerido)
- `PUT /api/v1/comments/:id` - Actualizar comentario (autor)
- `DELETE /api/v1/comments/:id` - Eliminar comentario (autor)

### Moderación
- `PUT /api/v1/posts/:id/moderate` - Moderar publicación (ADMIN/MODERATOR)
- `POST /api/v1/posts/:id/flag` - Reportar publicación

## Variables de Entorno

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=AlertaGT_Posts

# Autenticación
SERVICE_TOKEN=your-service-token
AUTH_SERVICE_URL=http://localhost:3010/api/v1

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Servicios externos
GEO_SERVICE_URL=http://localhost:3022/api/v1
NOTIFICATIONS_SERVICE_URL=http://localhost:3021/api/v1
```

## Migraciones

```bash
# Crear índices de base de datos
node scripts/create-indexes.js

# Ejecutar seed de datos
node scripts/seed-data.js
```

## Flujo de Publicación

1. Usuario crea publicación con ubicación
2. Se valida contenido y archivos
3. Se suben imágenes a Cloudinary
4. Se guarda en MongoDB
5. Se dispara notificación asíncrona a usuarios cercanos
6. Se envían push notifications via FCM

## Notas Técnicas

- Las coordenadas deben estar en formato GeoJSON `[longitude, latitude]`
- Los índices geoespaciales permiten búsquedas eficientes por proximidad
- La moderación permite estados: PENDING, APPROVED, REJECTED
- Las imágenes se almacenan en Cloudinary con optimización automática</content>
<parameter name="filePath">c:\AlertaGT\posts-service\README.md