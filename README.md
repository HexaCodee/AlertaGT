# AlertaGT

Aplicación de alertas geolocalizadas de arquitectura full-stack para la publicación de eventos de riesgo en la ciudad de Guatemala. Desarrollado utilizando React, Node.js y .NET bajo el marco ágil SCRUM, garantizando una sólida seguridad, escalabilidad y operaciones de alto rendimiento.

## Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │  Posts Service  │    │   Geo Service   │
│     (.NET 8)    │◄──►│   (Node.js)     │◄──►│   (Node.js)     │
│                 │    │                 │    │                 │
│ • JWT Auth      │    │ • CRUD Posts    │    │ • Geolocation   │
│ • User Mgmt     │    │ • Comments      │    │ • Nearby Search │
│ • Roles         │    │ • Moderation    │    │ • FCM Tokens    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │Notifications    │
                    │   Service       │
                    │   (Node.js)     │
                    │                 │
                    │ • Push Notifs   │
                    │ • FCM           │
                    │ • History       │
                    └─────────────────┘
```

## Servicios

### 🔐 Auth Service (.NET 8)
- **Puerto**: 3010
- **Base de datos**: MongoDB (AlertaGT_Auth)
- **Funciones**: Autenticación JWT, gestión de usuarios, roles, perfiles

### 📝 Posts Service (Node.js)
- **Puerto**: 3020
- **Base de datos**: MongoDB (AlertaGT_Posts)
- **Funciones**: CRUD de publicaciones, comentarios, moderación, búsqueda geoespacial

### 📍 Geolocation Service (Node.js)
- **Puerto**: 3022
- **Base de datos**: MongoDB (AlertaGT_Geo)
- **Funciones**: Ubicaciones de usuarios, búsquedas por proximidad, tokens FCM

### 🔔 Notifications Service (Node.js)
- **Puerto**: 3021
- **Base de datos**: MongoDB (AlertaGT_Notifications)
- **Funciones**: Notificaciones push via FCM, historial, preferencias

## Tecnologías Utilizadas

### Backend - .NET
- **Framework**: ASP.NET Core 8.0
- **Lenguaje**: C# (.NET 8)
- **Arquitectura**: Clean Architecture (4 capas)
- **ORM**: Entity Framework Core (MongoDB)
- **Validación**: FluentValidation
- **Logging**: Serilog

### Backend - Node.js
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Lenguaje**: JavaScript ES6+
- **Package Manager**: pnpm
- **ODM**: Mongoose (MongoDB)

### Base de Datos
- **Motor Principal**: MongoDB 6+
- **Índices**: Geoespaciales (2dsphere), texto, compuestos
- **Collation**: Español para ordenamiento correcto
- **Migraciones**: Scripts personalizados

### Seguridad
- **JWT**: Tokens con expiración (1h access, 7d refresh)
- **Hashing**: Argon2 (.NET), bcrypt (Node.js)
- **Rate Limiting**: Express rate-limit
- **CORS**: Configurado por servicio
- **Headers**: Helmet.js, NetEscapades.AspNetCore.SecurityHeaders

### Servicios Externos
- **Email**: MailKit (SMTP) - .NET
- **Almacenamiento**: Cloudinary (imágenes)
- **Notificaciones Push**: Firebase Cloud Messaging (FCM)

## 🚀 Despliegue

### Prerrequisitos

- **Docker y Docker Compose** (recomendado)
- **Node.js 18+** y **pnpm** (para desarrollo local)
- **.NET 8 SDK** (para Auth Service)
- **MongoDB** (para desarrollo local)

### Opción 1: Docker Compose (Recomendado)

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd AlertaGT
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con sus valores reales
   ```

3. **Desplegar con Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Verificar servicios**
   ```bash
   docker-compose ps
   ```

### Opción 2: Despliegue Local

1. **Instalar dependencias**
   ```bash
   # Auth Service
   cd auth-service
   dotnet restore

   # Servicios Node.js
   cd ../posts-service && pnpm install
   cd ../notifications-service && pnpm install
   cd ../geolocatedalerts-service && pnpm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env en cada directorio de servicio
   ```

3. **Iniciar MongoDB**
   ```bash
   # Con Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0

   # O instalar localmente
   brew install mongodb-community  # macOS
   sudo systemctl start mongod    # Linux
   ```

4. **Ejecutar migraciones**
   ```bash
   # Auth Service
   cd auth-service
   dotnet ef database update

   # Servicios Node.js
   cd ../posts-service && node scripts/create-indexes.js
   cd ../notifications-service && node scripts/create-indexes.js
   cd ../geolocatedalerts-service && node scripts/create-indexes.js
   ```

5. **Iniciar servicios**
   ```bash
   # Usar el script de despliegue
   chmod +x deploy.sh
   ./deploy.sh start
   ```

### Verificar Despliegue

Una vez desplegado, verificar que todos los servicios estén funcionando:

```bash
# Verificar health checks
curl http://localhost:3010/health  # Auth Service
curl http://localhost:3020/health  # Posts Service
curl http://localhost:3021/health  # Notifications Service
curl http://localhost:3022/health  # Geolocation Service
```

### URLs de Servicios

- **Auth Service**: http://localhost:3010
- **Posts Service**: http://localhost:3020
- **Notifications Service**: http://localhost:3021
- **Geolocation Service**: http://localhost:3022

## 🛠️ Desarrollo

### Estructura del Proyecto

```
AlertaGT/
├── auth-service/              # Servicio de autenticación (.NET)
├── posts-service/             # Servicio de publicaciones (Node.js)
├── notifications-service/     # Servicio de notificaciones (Node.js)
├── geolocatedalerts-service/  # Servicio de geolocalización (Node.js)
├── docker-compose.yml         # Configuración Docker
├── deploy.sh                  # Script de despliegue
└── .env.example              # Variables de entorno
```

### Comandos Útiles

```bash
# Ver logs de servicios
./deploy.sh logs auth-service
./deploy.sh logs posts-service

# Reiniciar servicios
./deploy.sh restart

# Detener todos los servicios
./deploy.sh stop

# Ver estado de servicios
./deploy.sh status
```

## 📊 Monitoreo y Logs

Los servicios generan logs estructurados que se almacenan en el directorio `logs/`:

- `auth-service.log`
- `posts-service.log`
- `notifications-service.log`
- `geolocatedalerts-service.log`

Para ver logs en tiempo real:
```bash
tail -f logs/auth-service.log
```

## 🔧 Configuración

### Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

- **Base de datos**: `MONGODB_URI`, `DATABASE_NAME`
- **Autenticación**: `JWT_SECRET`, `SERVICE_TOKEN`
- **Servicios externos**: `CLOUDINARY_*`, `FIREBASE_*`
- **Rate limiting**: `RATE_LIMIT_REQUESTS_PER_MINUTE`
- **CORS**: `CORS_ORIGINS`

### Indices de Base de Datos

Los índices de MongoDB se crean automáticamente al iniciar los servicios Node.js. Incluyen:

- **Indices geoespaciales**: Para búsquedas por ubicación
- **Indices de texto**: Con collation español para búsquedas
- **Indices compuestos**: Para optimizar consultas comunes

## 🧪 Testing

```bash
# Auth Service
cd auth-service
dotnet test

# Servicios Node.js
cd posts-service && pnpm test
cd notifications-service && pnpm test
cd geolocatedalerts-service && pnpm test
```

## 📝 API Documentation

Cada servicio incluye documentación OpenAPI/Swagger:

- **Auth Service**: http://localhost:3010/swagger
- **Posts Service**: http://localhost:3020/api-docs
- **Notifications Service**: http://localhost:3021/api-docs
- **Geolocation Service**: http://localhost:3022/api-docs

## API Endpoints

### Health Checks
- Auth: `GET /api/v1/health`
- Posts: `GET /api/v1/health`
- Geo: `GET /api/v1/health`
- Notifications: `GET /api/v1/health`

### Documentación API
Cada servicio incluye documentación detallada en su README respectivo.

## Flujo de Usuario Típico

1. **Registro/Login**: Usuario se registra en Auth Service
2. **Actualizar Ubicación**: App envía coordenadas a Geo Service
3. **Crear Alerta**: Usuario publica alerta en Posts Service
4. **Notificación Automática**: Sistema busca usuarios cercanos y envía push notifications
5. **Interacción**: Usuarios ven alertas, comentan, reportan contenido inapropiado

## Seguridad

- Autenticación JWT con refresh tokens
- Rate limiting en endpoints críticos
- Validación estricta de entrada
- Manejo seguro de excepciones
- Encriptación de datos sensibles
- Auditoría de acciones de moderación

## Escalabilidad

- Arquitectura de microservicios desacoplada
- Índices optimizados en MongoDB
- Circuit breaker en llamadas inter-servicio
- Caché potencial para búsquedas frecuentes
- Horizontal scaling posible por servicio

## Monitoreo

- Health checks en todos los servicios
- Logging estructurado (Serilog, Morgan)
- Manejo centralizado de errores
- Métricas de rendimiento por endpoint


## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

### Herramientas y Librerías

* **HTTP Client**: Axios (Node.js)
* **Monitoring**: Morgan (logging HTTP)
* **Environment**: dotenv (Node.js)

## Modelos de Request

### Registro (/log/register)

```json
{
  "Name": "Joshua",
  "Surname": "Solares",
  "username": "jsolares",
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123!",
  "phone": "12345678"
}
```

### Login (/log/login)

```json
{
    "EmailOrUsername":"admin",
    "Password":"Informatica2026?"
}
```

### Verificación de Email (/log/verify-email)

```json
{
    "Token": "lPXyiDMkuR9-1Kxu0X4gnKjhxZS4VDHQ2zCSJflNlXw"
}
```
## 📁 Estructura del Proyecto

```
AlertaGT/
│
├── auth-service/                         # Servicio de Autenticación (.NET)
│   ├── src/
│   │   ├── AuthService.Api/              # Capa de presentación (API)
│   │   │   ├── Controllers/              # Controladores HTTP
│   │   │   ├── Middlewares/              # Middlewares personalizados
│   │   │   ├── Extensions/               # Configuraciones y extensiones
│   │   │   ├── Program.cs                # Punto de entrada
│   │   │   ├── appsettings.json          # Configuración general
│   │   │   └── appsettings.Development.json  # Configuración de desarrollo
│   │   │
│   │   ├── AuthService.Application/      # Lógica de negocio
│   │   │   ├── DTOs/                     # Objetos de transferencia de datos
│   │   │   ├── Interfaces/               # Contratos de servicios
│   │   │   ├── Services/                 # Implementación de servicios
│   │   │   ├── Validators/               # Validaciones (FluentValidation)
│   │   │   └── Mappings/                 # Configuración de AutoMapper
│   │   │
│   │   ├── AuthService.Domain/           # Entidades y reglas de dominio
│   │   │   ├── Entities/                 # Entidades principales (User, Role)
│   │   │   ├── Enums/                    # Enumeraciones
│   │   │   └── ValueObjects/             # Objetos de valor
│   │   │
│   │   └── AuthService.Persistence/      # Acceso a datos (EF Core)
│   │       ├── Data/                     # DbContext y configuraciones
│   │       ├── Migrations/               # Migraciones de EF Core
│   │       └── Repositories/             # Implementación de repositorios
│   │
│   └── AuthService.sln                   # Solución .NET
│
├── geolocatedalerts-service/             # Servicio de Alertas Geolocalizadas (Node.js)
│   ├── src/
│   │   └── locations/                    # Controladores y rutas de ubicaciones
│   ├── configs/                          # Configuraciones globales
│   │   ├── app.js                        # Configuración de la aplicación
│   │   ├── cors.configuration.js         # Configuración CORS
│   │   ├── db.configuration.js           # Configuración de base de datos
│   │   └── helmet.configuration.js       # Configuración de seguridad
│   ├── middlewares/                      # Middlewares personalizados
│   ├── .env-example                      # Ejemplo de variables de entorno
│   ├── index.js                          # Punto de entrada
│   ├── package.json                      # Dependencias y scripts
│   └── pnpm-lock.yaml                    # Lock file de dependencias
│
├── notifications-service/                # Servicio de Notificaciones (Node.js)
│   ├── src/
│   │   ├── fcm/                          # Firebase Cloud Messaging
│   │   └── notifications/                # Controladores de notificaciones
│   ├── configs/                          # Configuraciones globales
│   │   ├── app.js                        # Configuración de la aplicación
│   │   ├── cors.configuration.js         # Configuración CORS
│   │   ├── db.configuration.js           # Configuración de base de datos
│   │   ├── firebase.configuration.js     # Configuración Firebase
│   │   └── helmet.configuration.js       # Configuración de seguridad
│   ├── middlewares/                      # Middlewares personalizados
│   ├── .env-example                      # Ejemplo de variables de entorno
│   ├── index.js                          # Punto de entrada
│   ├── package.json                      # Dependencias y scripts
│   └── pnpm-lock.yaml                    # Lock file de dependencias
│
├── posts-service/                        # Servicio de Publicaciones (Node.js)
│   ├── src/
│   │   ├── posts/                        # Controladores de publicaciones
│   │   └── comments/                     # Controladores de comentarios
│   ├── configs/                          # Configuraciones globales
│   │   ├── app.js                        # Configuración de la aplicación
│   │   ├── cloudinary.config.js          # Configuración Cloudinary
│   │   ├── cors.configuration.js         # Configuración CORS
│   │   ├── db.configuration.js           # Configuración de base de datos
│   │   └── helmet.configuration.js       # Configuración de seguridad
│   ├── middlewares/                      # Middlewares personalizados
│   ├── .env-example                      # Ejemplo de variables de entorno
│   ├── index.js                          # Punto de entrada
│   ├── package.json                      # Dependencias y scripts
│   └── pnpm-lock.yaml                    # Lock file de dependencias
│
├── LICENSE                               # Licencia del proyecto
└── README.md                             # Este archivo
```
## Configuración

### Requisitos Previos

* **Node.js** 18+ (para servicios Node.js)
* **.NET SDK** 8.0+ (para auth-service)
* **MongoDB** (para base de datos)
* **npm** o **pnpm** (gestor de paquetes)
* **Git**

---

## Instalación y Ejecución

### 1️⃣ Clonar el repositorio

```bash
git clone <url-repositorio>
cd AlertaGT
```

---

### 2️⃣ Configurar el servicio de autenticación (.NET)

#### 2.1 - Restaurar dependencias

```bash
cd auth-service
dotnet restore
```

#### 2.2 - Configurar variables de entorno

Crear o actualizar `src/AuthService.Api/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "mongodb://localhost:27017",
    "MongoDbDatabase": "alertagt_auth_dev"
  },
  "JwtSettings": {
    "SecretKey": "contraseña123",
    "Issuer": "AlertaGT",
    "Audience": "AlertaGTUsers",
    "ExpirationMinutes": 60
  },
  "AppSettings": {
    "FrontendUrl": "http://localhost:3000"
  }
}
```

#### 2.3 - Aplicar migraciones de base de datos

```bash
cd src/AuthService.Api
dotnet ef database update
```

#### 2.4 - Ejecutar el servicio

```bash
dotnet run
```

**El auth-service estará disponible en:** `http://localhost:5079/api/v1`

---

### 3️⃣ Configurar los servicios Node.js

#### 3.1 - Servicio de Alertas Geolocalizadas

```bash
cd ../../../geolocatedalerts-service
pnpm install
```

Crear `.env` basado en `.env-example` y configurar variables necesarias.

```bash
pnpm start
```

**Disponible en:** `http://localhost:3022/api/v1`

---

#### 3.2 - Servicio de Notificaciones

```bash
cd ../notifications-service
pnpm install
```

Crear `.env` basado en `.env-example`. Incluye configuración de Firebase:

```bash
pnpm start
```

**Disponible en:** `http://localhost:3021/api/v1`

---

#### 3.3 - Servicio de Publicaciones

```bash
cd ../posts-service
pnpm install
```

Crear `.env` basado en `.env-example`. Incluye configuración de Cloudinary:

```bash
pnpm start
```

**Disponible en:** `http://localhost:3020/api/v1`

---

### 4️⃣ Resumen de servicios ejecutándose

| Servicio | Puerto | URL |
|----------|--------|-----|
| Auth Service | 5079 | `http://localhost:5079/api/v1` |
| Geolocated Alerts | 3022 | `http://localhost:3022/api/v1` |
| Notifications | 3021 | `http://localhost:3021/api/v1` |
| Posts | 3020 | `http://localhost:3020/api/v1` |

---

### Variables de Configuración

Cada servicio requiere configuración específica. Revisa los archivos `.env-example` en cada carpeta de servicio para ver qué variables se necesitan.

## Créditos

Este proyecto incluye partes de código de KinalSports, específicamente el servicio de autenticación (registro e inicio de sesión de usuarios),
creado por Braulio Echeverría.

Repositorio: https://github.com/IN6AMProm33/auth-service-dotnet.git

## Licencia

Licencia MIT

---

---

# English

# AlertaGT

Geolocation-based alert application with full-stack architecture for publishing risk events in Guatemala City. Developed using React, Node.js, and .NET under the SCRUM agile framework, ensuring solid security, scalability, and high-performance operations.

## Key Features

### Authentication and Authorization

* User registration
* JWT login
* Route protection with JWT Bearer Authentication
* Role system
* Role-based access control
* Secure logout
* Account lockout on failed attempts

---

### Alert Publishing

* Alert creation
* Alert deletion
* Alert updates

---

### Geolocation

* User coordinate capture
* Alert search
* Nearby alerts to user

---

### Notifications

* Push notifications for alerts
* Notification history
* Notification preferences

---

### Security

* JWT tokens with expiration
* Sensitive data encryption
* Rate limiting on critical endpoints
* Global exception handling middleware

---

## Technologies Used

### Backend - .NET

* **Framework**: ASP.NET Core 8.0
* **Language**: C# (.NET 8)
* **Architecture**: Clean Architecture (4 layers)

### Backend - Node.js

* **Runtime**: Node.js 18+
* **Framework**: Express.js
* **Language**: JavaScript
* **Package Manager**: pnpm

### Database

* **Main Engine**: MongoDB
* **ORM (.NET)**: Entity Framework Core
* **Migrations**: EF Core Migrations
* **Naming Convention**: Snake case

### Security

* **JWT**: System.IdentityModel.Tokens.Jwt
* **Hashing**: Argon2 (Konscious.Security.Cryptography.Argon2)
* **Authentication**: Microsoft.AspNetCore.Authentication.JwtBearer
* **CORS**: Express CORS middleware
* **Headers**: 
  - NetEscapades.AspNetCore.SecurityHeaders (.NET)
  - Helmet.js (Node.js)
* **Rate Limiting**: Express rate-limit

### External Services

* **Email**: MailKit (SMTP)
* **Storage**: Cloudinary (profile images)
* **Push Notifications**: Firebase Cloud Messaging (FCM)

### Validation and Logging

* **Validation**: 
  - FluentValidation (.NET)
  - Express middleware validators (Node.js)
* **Logging**: 
  - Serilog.AspNetCore (.NET)
  - Morgan (Node.js)

### Tools and Libraries

* **HTTP Client**: Axios (Node.js)
* **Monitoring**: Morgan (HTTP logging)
* **Environment**: dotenv (Node.js)

## Request Models

### Registration (/log/register)

```json
{
  "Name": "Joshua",
  "Surname": "Solares",
  "username": "jsolares",
  "email": "user@example.com",
  "password": "Password123!",
  "phone": "12345678"
}
```

### Login (/log/login)

```json
{
    "EmailOrUsername":"admin",
    "Password":"Informatica2026?"
}
```

### Email Verification (/log/verify-email)

```json
{
    "Token": "lPXyiDMkuR9-1Kxu0X4gnKjhxZS4VDHQ2zCSJflNlXw"
}
```

## 📁 Project Structure

```
AlertaGT/
│
├── auth-service/                         # Authentication Service (.NET)
│   ├── src/
│   │   ├── AuthService.Api/              # Presentation layer (API)
│   │   │   ├── Controllers/              # HTTP Controllers
│   │   │   ├── Middlewares/              # Custom middlewares
│   │   │   ├── Extensions/               # Configurations and extensions
│   │   │   ├── Program.cs                # Entry point
│   │   │   ├── appsettings.json          # General configuration
│   │   │   └── appsettings.Development.json  # Development configuration
│   │   │
│   │   ├── AuthService.Application/      # Business logic
│   │   │   ├── DTOs/                     # Data transfer objects
│   │   │   ├── Interfaces/               # Service contracts
│   │   │   ├── Services/                 # Service implementation
│   │   │   ├── Validators/               # Validations (FluentValidation)
│   │   │   └── Mappings/                 # AutoMapper configuration
│   │   │
│   │   ├── AuthService.Domain/           # Domain entities and business rules
│   │   │   ├── Entities/                 # Main entities (User, Role)
│   │   │   ├── Enums/                    # Enumerations
│   │   │   └── ValueObjects/             # Value objects
│   │   │
│   │   └── AuthService.Persistence/      # Data access (EF Core)
│   │       ├── Data/                     # DbContext and configurations
│   │       ├── Migrations/               # EF Core migrations
│   │       └── Repositories/             # Repository implementation
│   │
│   └── AuthService.sln                   # .NET Solution
│
├── geolocatedalerts-service/             # Geolocation Alerts Service (Node.js)
│   ├── src/
│   │   └── locations/                    # Location controllers and routes
│   ├── configs/                          # Global configurations
│   │   ├── app.js                        # Application configuration
│   │   ├── cors.configuration.js         # CORS configuration
│   │   ├── db.configuration.js           # Database configuration
│   │   └── helmet.configuration.js       # Security configuration
│   ├── middlewares/                      # Custom middlewares
│   ├── .env-example                      # Environment variables example
│   ├── index.js                          # Entry point
│   ├── package.json                      # Dependencies and scripts
│   └── pnpm-lock.yaml                    # Dependency lock file
│
├── notifications-service/                # Notifications Service (Node.js)
│   ├── src/
│   │   ├── fcm/                          # Firebase Cloud Messaging
│   │   └── notifications/                # Notification controllers
│   ├── configs/                          # Global configurations
│   │   ├── app.js                        # Application configuration
│   │   ├── cors.configuration.js         # CORS configuration
│   │   ├── db.configuration.js           # Database configuration
│   │   ├── firebase.configuration.js     # Firebase configuration
│   │   └── helmet.configuration.js       # Security configuration
│   ├── middlewares/                      # Custom middlewares
│   ├── .env-example                      # Environment variables example
│   ├── index.js                          # Entry point
│   ├── package.json                      # Dependencies and scripts
│   └── pnpm-lock.yaml                    # Dependency lock file
│
├── posts-service/                        # Publications Service (Node.js)
│   ├── src/
│   │   ├── posts/                        # Publication controllers
│   │   └── comments/                     # Comment controllers
│   ├── configs/                          # Global configurations
│   │   ├── app.js                        # Application configuration
│   │   ├── cloudinary.config.js          # Cloudinary configuration
│   │   ├── cors.configuration.js         # CORS configuration
│   │   ├── db.configuration.js           # Database configuration
│   │   └── helmet.configuration.js       # Security configuration
│   ├── middlewares/                      # Custom middlewares
│   ├── .env-example                      # Environment variables example
│   ├── index.js                          # Entry point
│   ├── package.json                      # Dependencies and scripts
│   └── pnpm-lock.yaml                    # Dependency lock file
│
├── LICENSE                               # Project license
└── README.md                             # This file
```

## Configuration

### Prerequisites

* **Node.js** 18+ (for Node.js services)
* **.NET SDK** 8.0+ (for auth-service)
* **MongoDB** (for database)
* **npm** or **pnpm** (package manager)
* **Git**

---

## Installation and Execution

### 1️⃣ Clone the repository

```bash
git clone <repository-url>
cd AlertaGT
```

---

### 2️⃣ Configure the authentication service (.NET)

#### 2.1 - Restore dependencies

```bash
cd auth-service
dotnet restore
```

#### 2.2 - Configure environment variables

Create or update `src/AuthService.Api/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "mongodb://localhost:27017",
    "MongoDbDatabase": "alertagt_auth_dev"
  },
  "JwtSettings": {
    "SecretKey": "your-super-secure-secret-key",
    "Issuer": "AlertaGT",
    "Audience": "AlertaGTUsers",
    "ExpirationMinutes": 60
  },
  "AppSettings": {
    "FrontendUrl": "http://localhost:3000"
  }
}
```

#### 2.3 - Apply database migrations

```bash
cd src/AuthService.Api
dotnet ef database update
```

#### 2.4 - Run the service

```bash
dotnet run
```

**The auth-service will be available at:** `http://localhost:5079/api/v1`

---

### 3️⃣ Configure Node.js services

#### 3.1 - Geolocation Alerts Service

```bash
cd ../../../geolocatedalerts-service
pnpm install
```

Create `.env` based on `.env-example` and configure necessary variables.

```bash
pnpm start
```

**Available at:** `http://localhost:3022/api/v1`

---

#### 3.2 - Notifications Service

```bash
cd ../notifications-service
pnpm install
```

Create `.env` based on `.env-example`. Includes Firebase configuration:

```bash
pnpm start
```

**Available at:** `http://localhost:3021/api/v1`

---

#### 3.3 - Publications Service

```bash
cd ../posts-service
pnpm install
```

Create `.env` based on `.env-example`. Includes Cloudinary configuration:

```bash
pnpm start
```

**Available at:** `http://localhost:3020/api/v1`

---

### 4️⃣ Summary of running services

| Service | Port | URL |
|---------|------|-----|
| Auth Service | 5079 | `http://localhost:5079/api/v1` |
| Geolocated Alerts | 3022 | `http://localhost:3022/api/v1` |
| Notifications | 3021 | `http://localhost:3021/api/v1` |
| Posts | 3020 | `http://localhost:3020/api/v1` |

---

### Configuration Variables

Each service requires specific configuration. Check the `.env-example` files in each service folder to see what variables are needed.

## Credits

This project includes code from KinalSports, specifically the authentication service (user registration and login),
created by Braulio Echeverría.

Repository: https://github.com/IN6AMProm33/auth-service-dotnet.git

## License

MIT License