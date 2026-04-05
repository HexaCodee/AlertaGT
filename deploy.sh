#!/bin/bash

# Script de despliegue para AlertaGT
# Uso: ./deploy.sh [start|stop|restart|status]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloreados
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Función para esperar a que un servicio esté listo
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    print_message "Esperando a que $service_name esté listo en $url..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s --max-time 5 "$url/health" > /dev/null 2>&1; then
            print_success "$service_name está listo"
            return 0
        fi

        print_message "Intento $attempt/$max_attempts - $service_name no está listo aún..."
        sleep 2
        ((attempt++))
    done

    print_error "$service_name no respondió después de $max_attempts intentos"
    return 1
}

# Función para iniciar MongoDB (si no está corriendo)
start_mongodb() {
    print_message "Verificando MongoDB..."

    if pgrep mongod > /dev/null; then
        print_success "MongoDB ya está ejecutándose"
    else
        print_message "Iniciando MongoDB..."
        if command -v brew >/dev/null 2>&1; then
            # macOS con Homebrew
            brew services start mongodb-community
        elif command -v systemctl >/dev/null 2>&1; then
            # Linux con systemd
            sudo systemctl start mongod
        else
            print_warning "No se pudo determinar cómo iniciar MongoDB. Inícielo manualmente."
            return 1
        fi

        sleep 3

        if pgrep mongod > /dev/null; then
            print_success "MongoDB iniciado correctamente"
        else
            print_error "No se pudo iniciar MongoDB"
            return 1
        fi
    fi
}

# Función para ejecutar migraciones
run_migrations() {
    print_message "Ejecutando migraciones de base de datos..."

    # Auth Service
    if [ -d "auth-service" ]; then
        cd auth-service
        print_message "Ejecutando migraciones de Auth Service..."
        dotnet ef database update --project src/AuthService.Persistence/AuthService.Persistence.csproj
        cd ..
    fi

    # Node.js services
    for service in "geolocatedalerts-service" "posts-service" "notifications-service"; do
        if [ -d "$service" ]; then
            cd "$service"
            print_message "Ejecutando script de índices para $service..."
            node scripts/create-indexes.js
            cd ..
        fi
    done

    print_success "Migraciones completadas"
}

# Función para iniciar un servicio Node.js
start_node_service() {
    local service_dir=$1
    local service_name=$2
    local port=$3

    if [ ! -d "$service_dir" ]; then
        print_warning "Directorio $service_dir no encontrado, saltando $service_name"
        return 1
    fi

    cd "$service_dir"

    # Verificar si ya está corriendo
    if check_port $port; then
        print_warning "$service_name ya está ejecutándose en el puerto $port"
        cd ..
        return 0
    fi

    print_message "Iniciando $service_name..."

    # Instalar dependencias si no existen
    if [ ! -d "node_modules" ]; then
        print_message "Instalando dependencias de $service_name..."
        pnpm install
    fi

    # Copiar .env si no existe
    if [ ! -f ".env" ] && [ -f "../.env.example" ]; then
        cp ../.env.example .env
        print_warning "Se copió .env.example a .env. Configure las variables de entorno."
    fi

    # Iniciar en background
    nohup pnpm start > "../logs/$service_name.log" 2>&1 &
    local pid=$!

    echo $pid > "../logs/$service_name.pid"

    cd ..

    # Esperar a que el servicio esté listo
    wait_for_service "http://localhost:$port" "$service_name"

    print_success "$service_name iniciado (PID: $pid)"
}

# Función para iniciar Auth Service (.NET)
start_auth_service() {
    local port=3010

    if [ ! -d "auth-service" ]; then
        print_warning "Directorio auth-service no encontrado"
        return 1
    fi

    cd auth-service

    # Verificar si ya está corriendo
    if check_port $port; then
        print_warning "Auth Service ya está ejecutándose en el puerto $port"
        cd ..
        return 0
    fi

    print_message "Iniciando Auth Service (.NET)..."

    # Iniciar en background
    nohup dotnet run --project src/AuthService.Api/AuthService.Api.csproj > "../logs/auth-service.log" 2>&1 &
    local pid=$!

    echo $pid > "../logs/auth-service.pid"

    cd ..

    # Esperar a que el servicio esté listo
    wait_for_service "http://localhost:$port/health" "Auth Service"

    print_success "Auth Service iniciado (PID: $pid)"
}

# Función para detener servicios
stop_services() {
    print_message "Deteniendo servicios..."

    # Detener procesos por PID
    for pid_file in logs/*.pid; do
        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file")
            local service_name=$(basename "$pid_file" .pid)

            if kill -0 $pid 2>/dev/null; then
                print_message "Deteniendo $service_name (PID: $pid)..."
                kill $pid
                rm "$pid_file"
            else
                print_warning "$service_name (PID: $pid) no está ejecutándose"
                rm "$pid_file"
            fi
        fi
    done

    # Detener MongoDB si fue iniciado por el script
    if pgrep mongod > /dev/null; then
        print_message "Deteniendo MongoDB..."
        if command -v brew >/dev/null 2>&1; then
            brew services stop mongodb-community
        elif command -v systemctl >/dev/null 2>&1; then
            sudo systemctl stop mongod
        fi
    fi

    print_success "Servicios detenidos"
}

# Función para mostrar estado
show_status() {
    print_message "Estado de los servicios:"

    # MongoDB
    if pgrep mongod > /dev/null; then
        print_success "MongoDB: Ejecutándose"
    else
        print_error "MongoDB: Detenido"
    fi

    # Auth Service
    if check_port 3010; then
        print_success "Auth Service: Ejecutándose (puerto 3010)"
    else
        print_error "Auth Service: Detenido"
    fi

    # Posts Service
    if check_port 3020; then
        print_success "Posts Service: Ejecutándose (puerto 3020)"
    else
        print_error "Posts Service: Detenido"
    fi

    # Notifications Service
    if check_port 3021; then
        print_success "Notifications Service: Ejecutándose (puerto 3021)"
    else
        print_error "Notifications Service: Detenido"
    fi

    # Geolocation Service
    if check_port 3022; then
        print_success "Geolocation Service: Ejecutándose (puerto 3022)"
    else
        print_error "Geolocation Service: Detenido"
    fi
}

# Crear directorio de logs
mkdir -p logs

case "${1:-start}" in
    start)
        print_message "Iniciando despliegue de AlertaGT..."

        # Iniciar MongoDB
        start_mongodb

        # Ejecutar migraciones
        run_migrations

        # Iniciar servicios en orden de dependencias
        start_auth_service
        start_node_service "geolocatedalerts-service" "Geolocation Service" 3022
        start_node_service "posts-service" "Posts Service" 3020
        start_node_service "notifications-service" "Notifications Service" 3021

        print_success "Despliegue completado. Servicios disponibles en:"
        echo "  - Auth Service: http://localhost:3010"
        echo "  - Posts Service: http://localhost:3020"
        echo "  - Notifications Service: http://localhost:3021"
        echo "  - Geolocation Service: http://localhost:3022"
        ;;

    stop)
        stop_services
        ;;

    restart)
        print_message "Reiniciando servicios..."
        stop_services
        sleep 2
        $0 start
        ;;

    status)
        show_status
        ;;

    logs)
        if [ -z "$2" ]; then
            print_error "Uso: $0 logs <service-name>"
            echo "Servicios disponibles: auth-service, posts-service, notifications-service, geolocatedalerts-service"
            exit 1
        fi

        log_file="logs/$2.log"
        if [ -f "$log_file" ]; then
            tail -f "$log_file"
        else
            print_error "Archivo de log no encontrado: $log_file"
        fi
        ;;

    *)
        print_error "Uso: $0 [start|stop|restart|status|logs <service>]"
        exit 1
        ;;
esac