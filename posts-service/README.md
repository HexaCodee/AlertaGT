# Posts Service

Servicio de publicaciones y comentarios para AlertaGT, construido con Node.js y Express.

## Qué contiene

- Publicaciones con campos de ubicación y moderación
- Comentarios asociados a publicaciones
- Subida y gestión de imágenes con Cloudinary
- Búsqueda geoespacial de publicaciones cercanas
- Documentación Swagger en `/api-docs`

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- Cloudinary
- Multer
- Swagger (swagger-jsdoc + swagger-ui-express)

## Uso rápido

```bash
cd posts-service
pnpm install
pnpm start
```

Para desarrollo:

```bash
pnpm dev
```

La API se expone por defecto en `http://localhost:3020` y la documentación Swagger en `http://localhost:3020/api-docs`.

## Variables de entorno

Crea un archivo `.env` con los valores necesarios:

```env
PORT=3020
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=AlertaGT_Posts
SERVICE_TOKEN=your-service-token
AUTH_SERVICE_URL=http://localhost:3010/api/v1
GEO_SERVICE_URL=http://localhost:3022/api/v1
NOTIFICATIONS_SERVICE_URL=http://localhost:3021/api/v1
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RATE_LIMIT_REQUESTS_PER_MINUTE=100
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

## Endpoints principales

### Publicaciones

- `GET /api/v1/posts` — Lista publicaciones
- `GET /api/v1/posts/:id` — Obtiene publicación por ID
- `GET /api/v1/posts/proximity/search` — Búsqueda por proximidad
- `POST /api/v1/posts` — Crea publicación (JWT requerido)
- `PUT /api/v1/posts/:id` — Actualiza publicación
- `DELETE /api/v1/posts/:id` — Elimina publicación

### Comentarios

- `GET /api/v1/comments/post/:postId` — Lista comentarios de una publicación
- `POST /api/v1/comments` — Crea comentario (JWT requerido)
- `PUT /api/v1/comments/:id` — Actualiza comentario
- `DELETE /api/v1/comments/:id` — Elimina comentario

### Moderación y reporte

- `PUT /api/v1/posts/:id/moderate` — Moderar publicación (ADMIN_ROLE, MODERATOR_ROLE)
- `POST /api/v1/posts/:id/flag` — Reportar publicación

## Arquitectura de carpetas

```
posts-service/
├── configs/
│   ├── app.js
│   ├── db.configuration.js
│   ├── cloudinary.config.js
│   └── documentation.js
├── middlewares/
├── scripts/
├── src/
│   ├── comments/
│   └── posts/
└── index.js
```

## Scripts útiles

```bash
pnpm install
pnpm dev
pnpm start
node scripts/create-indexes.js
node scripts/seed-data.js
```

## Notas

- Asegura que MongoDB esté disponible en la URI configurada.
- La documentación Swagger está activa en `/api-docs`.
- Las coordenadas de ubicación usan GeoJSON: `[longitude, latitude]`.
- El servicio requiere `SERVICE_TOKEN` y `AUTH_SERVICE_URL` para comunicación con otros microservicios.</content>
<parameter name="filePath">c:\AlertaGT\posts-service\README.md