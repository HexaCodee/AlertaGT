# Dockerfile para servicios Node.js (Posts, Notifications, Geolocation, Reputation)
# Node 20+ es requerido por mongoose 9 (usa el objeto `crypto` global, ausente en Node 18).
FROM node:20-alpine AS base

# Instalar pnpm
RUN npm install -g pnpm

# Herramientas mínimas para healthchecks
RUN apk add --no-cache curl

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Cambiar propietario de los archivos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto (se configura en docker-compose.yml)
EXPOSE 3023

# Comando de entrada
CMD ["pnpm", "start"]
