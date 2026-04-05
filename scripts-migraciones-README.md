# Scripts de Migración y Seed - AlertaGT

Este directorio contiene scripts para inicializar las bases de datos MongoDB de todos los microservicios de AlertaGT.

## 📋 Servicios y Bases de Datos

| Servicio | Base de Datos | Descripción |
|----------|---------------|-------------|
| **auth-service** | `AlertaGT_Auth` | Autenticación, usuarios, roles |
| **geolocatedalerts-service** | `AlertaGT_Geo` | Ubicaciones de usuarios, búsquedas geoespaciales |
| **posts-service** | `AlertaGT_Posts` | Alertas, comentarios, moderación |
| **notifications-service** | `AlertaGT_Notifications` | Notificaciones push y sistema |

## 🚀 Uso de los Scripts

### Prerrequisitos

1. **MongoDB** debe estar ejecutándose
2. **Node.js** instalado (para ejecutar los scripts)
3. **npm** o **yarn** para instalar dependencias

### Variables de Entorno

Configura las siguientes variables de entorno (o usa los valores por defecto):

```bash
# Conexión a MongoDB
export MONGODB_URI="mongodb://localhost:27017"

# Nombres de bases de datos (opcional, tienen valores por defecto)
export DATABASE_NAME_AUTH="AlertaGT_Auth"
export DATABASE_NAME_GEO="AlertaGT_Geo"
export DATABASE_NAME_POSTS="AlertaGT_Posts"
export DATABASE_NAME_NOTIFICATIONS="AlertaGT_Notifications"
```

### Instalación de Dependencias

Para cada servicio, instala las dependencias necesarias:

```bash
# Auth Service
cd auth-service/scripts
npm install mongodb uuid

# Geo Service
cd geolocatedalerts-service/scripts
npm install mongodb

# Posts Service
cd posts-service/scripts
npm install mongodb

# Notifications Service
cd notifications-service/scripts
npm install mongodb
```

## 📝 Scripts Disponibles

### 1. Crear Índices (`create-indexes.js`)

Crea todos los índices necesarios para optimizar consultas en cada servicio.

#### Auth Service
```bash
cd auth-service/scripts
node create-indexes.js
```
**Índices creados:**
- `username`: único, sparse
- `email`: único, sparse
- `user_emails.userId`: único, sparse
- `user_password_resets.userId`: único, sparse
- `users.status + createdAt`: compuesto
- `users.createdAt`: descendente

#### Geo Service
```bash
cd geolocatedalerts-service/scripts
node create-indexes.js
```
**Índices creados:**
- `location`: 2dsphere (geoespacial)
- `userId`: único
- `isActive`: filtrado
- `isActive + lastLocationUpdate`: compuesto
- `lastLocationUpdate`: descendente
- `searchRadius`: optimización

#### Posts Service
```bash
cd posts-service/scripts
node create-indexes.js
```
**Índices creados:**
- `location.coordinates`: 2dsphere (geoespacial)
- `isActive`, `isPublished`, `category`, `authorId`, `riskType`
- `authorId + isActive`: compuesto
- `moderation.status + isPublished`: compuesto
- `createdAt`: descendente
- `comments.postId + isActive`: compuesto
- `comments.authorId + isActive`: compuesto

#### Notifications Service
```bash
cd notifications-service/scripts
node create-indexes.js
```
**Índices creados:**
- `userId + createdAt`: compuesto (notificaciones por usuario)
- `read + userId`: compuesto (no leídas)
- `postId`, `type`, `sentViaFCM`
- `type + userId`: compuesto
- `readAt`: descendente, sparse

### 2. Seed de Datos (`seed-data.js`)

Crea datos de prueba para desarrollo y testing.

#### ⚠️ IMPORTANTE
- Los datos de seed son **SOLO PARA DESARROLLO**
- **NO EJECUTAR EN PRODUCCIÓN**
- Eliminar datos de prueba antes de producción

#### Auth Service
```bash
cd auth-service/scripts
node seed-data.js
```
**Datos creados:**
- Roles: `ADMIN_ROLE`, `USER_ROLE`
- Usuario admin: `admin` / `Informatica2026?` (¡CAMBIAR EN PRODUCCIÓN!)

#### Geo Service
```bash
cd geolocatedalerts-service/scripts
node seed-data.js
```
**Datos creados:**
- Ubicaciones de prueba en ciudades de Guatemala
- Usuarios de prueba con coordenadas reales

#### Posts Service
```bash
cd posts-service/scripts
node seed-data.js
```
**Datos creados:**
- Posts de prueba con diferentes categorías y riesgos
- Comentarios de prueba en los posts
- Ubicaciones geoespaciales

#### Notifications Service
```bash
cd notifications-service/scripts
node seed-data.js
```
**Datos creados:**
- Notificaciones de diferentes tipos
- Estados de lectura variados
- Datos FCM simulados

## 🔄 Orden de Ejecución Recomendado

Para inicializar completamente el sistema:

```bash
# 1. Auth Service (primero, crea roles y admin)
cd auth-service/scripts
node create-indexes.js
node seed-data.js

# 2. Geo Service
cd ../../geolocatedalerts-service/scripts
node create-indexes.js
node seed-data.js

# 3. Posts Service
cd ../../posts-service/scripts
node create-indexes.js
node seed-data.js

# 4. Notifications Service
cd ../../notifications-service/scripts
node create-indexes.js
node seed-data.js
```

## 🔧 Solución de Problemas

### Error de Conexión
```
MongoServerError: connect ECONNREFUSED ::1:27017
```
**Solución:** Asegúrate de que MongoDB esté ejecutándose:
```bash
# Linux/Mac
sudo systemctl start mongod
# o
mongod

# Windows
net start MongoDB
```

### Índices Ya Existen
```
MongoServerError: Index with name: xxx already exists
```
**Solución:** Los scripts ignoran errores de índices existentes. Es seguro ejecutar múltiples veces.

### Base de Datos No Existe
Los scripts crean automáticamente las bases de datos si no existen.

## 📊 Verificación

Para verificar que los índices se crearon correctamente:

```javascript
// Conectar a MongoDB y ejecutar:
use AlertaGT_Auth
db.users.getIndexes()

use AlertaGT_Geo
db.userlocations.getIndexes()

use AlertaGT_Posts
db.posts.getIndexes()
db.comments.getIndexes()

use AlertaGT_Notifications
db.notifications.getIndexes()
```

## 🛡️ Seguridad

- **Contraseñas:** Las contraseñas de seed usan hash simple (NO Argon2). Cambiar inmediatamente.
- **Datos de Prueba:** Eliminar todos los datos de prueba antes de producción.
- **Variables de Entorno:** No commitear credenciales reales en el código.

## 📝 Notas de Producción

1. **Backup:** Hacer backup antes de ejecutar scripts en producción
2. **Monitoreo:** Los índices pueden afectar rendimiento durante creación
3. **Capacidad:** Asegurar suficiente espacio en disco para índices
4. **Replicación:** En clusters, crear índices en todos los nodos

---

**AlertaGT - Sistema de Alertas Geolocalizadas de Guatemala** 🇬🇹</content>
<parameter name="filePath">c:\AlertaGT\SCRIPTS_MIGRACIONES_README.md