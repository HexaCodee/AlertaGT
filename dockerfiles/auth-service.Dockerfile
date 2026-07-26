FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["auth-service/AuthService.sln", "./"]
COPY ["auth-service/src/AuthService.Domain/AuthService.Domain.csproj", "src/AuthService.Domain/"]
COPY ["auth-service/src/AuthService.Persistence/AuthService.Persistence.csproj", "src/AuthService.Persistence/"]
COPY ["auth-service/src/AuthService.Application/AuthService.Application.csproj", "src/AuthService.Application/"]
COPY ["auth-service/src/AuthService.Api/AuthService.Api.csproj", "src/AuthService.Api/"]

RUN dotnet restore "AuthService.sln"

COPY auth-service/. .
RUN dotnet publish "src/AuthService.Api/AuthService.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:3010
# Los contenedores de Render tienen un limite bajo de inotify; evita el
# FileSystemWatcher de appsettings.json que no necesitamos en produccion.
ENV DOTNET_hostBuilder__reloadConfigOnChange=false

EXPOSE 3010

ENTRYPOINT ["dotnet", "AuthService.Api.dll"]
