# syntax=docker/dockerfile:1

# 1. Build the React app into the API's wwwroot (PD-02: same origin).
FROM node:26-bookworm-slim AS web
WORKDIR /src/src/ECo.Web
COPY src/ECo.Web/package.json src/ECo.Web/package-lock.json ./
RUN npm ci
COPY src/ECo.Web/ ./
RUN npm run build

# 2. Publish the API with the built SPA inside it.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api
WORKDIR /src
COPY global.json nuget.config Directory.Build.props ./
COPY src/ECo.Api/ECo.Api.csproj src/ECo.Api/
RUN dotnet restore src/ECo.Api/ECo.Api.csproj
COPY src/ECo.Api/ src/ECo.Api/
COPY --from=web /src/src/ECo.Api/wwwroot src/ECo.Api/wwwroot
RUN dotnet publish src/ECo.Api/ECo.Api.csproj -c Release -o /app --no-restore

# 3. Runtime image. The default (non-Alpine) image ships ICU, so Store:Locale cultures resolve.
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
# The base image already listens on 8080 (ASPNETCORE_HTTP_PORTS).
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false \
    DataProtection__KeysPath=/data/keys
COPY --from=api /app .
# Owned by the app user so a volume mounted here inherits writable ownership.
RUN mkdir -p /data/keys && chown "$APP_UID" /data/keys
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "ECo.Api.dll"]
