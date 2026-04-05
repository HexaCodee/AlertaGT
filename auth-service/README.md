# Auth Service

Servicio de autenticación y autorización para la aplicación AlertaGT, construido con .NET 8 y Clean Architecture.

## Características

- ✅ Registro e inicio de sesión de usuarios
- ✅ Autenticación JWT con refresh tokens
- ✅ Sistema de roles (USER, ADMIN, MODERATOR)
- ✅ Gestión de perfiles de usuario
- ✅ Validación de contraseñas seguras
- ✅ Rate limiting y protección contra ataques
- ✅ Integración con Cloudinary para avatares
- ✅ Manejo centralizado de excepciones

## Stack Tecnológico

- **.NET 8** (ASP.NET Core)
- **C# 12**
- **MongoDB** con índices optimizados
- **JWT** para autenticación
- **FluentValidation** para validaciones
- **Serilog** para logging
- **MailKit** para envío de emails
- **Cloudinary** para gestión de imágenes

## Arquitectura

```
AuthService.Api/
├── Controllers/          # Controladores de API
├── Extensions/           # Extensiones de servicios
├── Middlewares/          # Middleware personalizado
├── Models/               # Modelos de respuesta
└── Program.cs            # Punto de entrada

AuthService.Application/
├── DTOs/                 # Data Transfer Objects
├── Exceptions/           # Excepciones personalizadas
├── Interfaces/           # Contratos de servicios
├── Services/             # Lógica de negocio
└── Validators/           # Validaciones con FluentValidation

AuthService.Domain/
├── Entities/             # Entidades de dominio
├── Enums/                # Enumeraciones
└── Interfaces/           # Interfaces de repositorio

AuthService.Persistence/
├── Data/                 # Configuración de MongoDB
├── Migrations/           # Scripts de migración
└── Repositories/         # Implementaciones de repositorio
```

## Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Cierre de sesión

### Usuarios
- `GET /api/users/profile` - Perfil del usuario actual
- `PUT /api/users/profile` - Actualizar perfil
- `POST /api/users/avatar` - Subir avatar
- `GET /api/users/{id}/stats` - Estadísticas de usuario

### Administración
- `GET /api/admin/users` - Lista de usuarios (ADMIN)
- `PUT /api/admin/users/{id}/role` - Cambiar rol (ADMIN)
- `DELETE /api/admin/users/{id}` - Eliminar usuario (ADMIN)

## Variables de Entorno

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=AlertaGT_Auth

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION_MINUTES=60
JWT_REFRESH_EXPIRATION_DAYS=7

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=10
```

## Migraciones

```bash
# Crear índices de base de datos
node scripts/create-indexes.js

# Ejecutar seed de datos
node scripts/seed-data.js
```

## Notas de Seguridad

- Las contraseñas se hashean con Argon2
- Los tokens JWT tienen expiración corta (1 hora)
- Implementa rate limiting en endpoints críticos
- Validación estricta de entrada con FluentValidation
- Manejo seguro de excepciones sin exponer información sensible</content>
<parameter name="filePath">c:\AlertaGT\auth-service\README.md