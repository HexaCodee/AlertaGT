# Español
# AlertaGT

Aplicación de alertas geolocalizadas de arquitectura full-stack para la publicación de eventos de riesgo en la ciudad de Guatemala. Desarrollado utilizando React, Node.js y .NET bajo el marco ágil SCRUM, garantizando una sólida seguridad, escalabilidad y operaciones de alto rendimiento.

## Funcionalidades Principales

### Autenticación y Autorización

* Registro de usuarios
* Inicio de sesión con JWT
* Protección de rutas con JWT Bearer Authentication
* Sistema de roles
* Control de acceso basado en roles
* Cierre de sesión seguro
* Bloqueo de cuenta por intentos fallidos

---

### Publicación de Alertas

* Creación de las alertas
* Eliminación de las alertas
* Actualización de las alertas

---

### Geolocalización

* Captura de coordenadas del usuario
* Búsqueda de alertas
* Alertas cercanas al usuario

---

### Notificaciones

* Notificaciones push de las alertas
* Historial de notificaciones
* Preferencias de notificación

---

### Seguridad

* Tokens JWT con expiración
* Encriptación de datos sensibles
* Rate limiting en endpoints críticos
* Middleware de manejo global de excepciones

---

## Tecnologías Utilizadas

### Backend - .NET

* **Framework**: ASP.NET Core 8.0
* **Lenguaje**: C# (.NET 8)
* **Arquitectura**: Clean Architecture (4 capas)

### Backend - Node.js

* **Runtime**: Node.js 18+
* **Framework**: Express.js
* **Lenguaje**: JavaScript
* **Package Manager**: pnpm

### Base de Datos

* **Motor Principal**: MongoDB
* **ORM (.NET)**: Entity Framework Core
* **Migraciones**: EF Core Migrations
* **Naming Convention**: Snake case

### Seguridad

* **JWT**: System.IdentityModel.Tokens.Jwt
* **Hashing**: Argon2 (Konscious.Security.Cryptography.Argon2)
* **Authentication**: Microsoft.AspNetCore.Authentication.JwtBearer
* **CORS**: Express CORS middleware
* **Headers**: 
  - NetEscapades.AspNetCore.SecurityHeaders (.NET)
  - Helmet.js (Node.js)
* **Rate Limiting**: Express rate-limit

### Servicios Externos

* **Email**: MailKit (SMTP)
* **Almacenamiento**: Cloudinary (imágenes de perfil)
* **Notificaciones Push**: Firebase Cloud Messaging (FCM)

### Validación y Logging

* **Validación**: 
  - FluentValidation (.NET)
  - Express middleware validators (Node.js)
* **Logging**: 
  - Serilog.AspNetCore (.NET)
  - Morgan (Node.js)

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