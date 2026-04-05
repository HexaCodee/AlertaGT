# Dockerfile para Auth Service (.NET)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivos de proyecto y restaurar dependencias
COPY ["src/AuthService.Api/AuthService.Api.csproj", "src/AuthService.Api/"]
COPY ["src/AuthService.Application/AuthService.Application.csproj", "src/AuthService.Application/"]
COPY ["src/AuthService.Domain/AuthService.Domain.csproj", "src/AuthService.Domain/"]
COPY ["src/AuthService.Persistence/AuthService.Persistence.csproj", "src/AuthService.Persistence/"]
COPY ["AuthService.sln", "."]

RUN dotnet restore "AuthService.sln"

# Copiar el código fuente
COPY . .

# Publicar la aplicación
RUN dotnet publish "src/AuthService.Api/AuthService.Api.csproj" -c Release -o /app/publish

# Imagen de runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Instalar curl para health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copiar la aplicación publicada
COPY --from=build /app/publish .

# Exponer puerto
EXPOSE 3010

# Comando de entrada
ENTRYPOINT ["dotnet", "AuthService.Api.dll"]