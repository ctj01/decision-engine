## Improved multi-stage Dockerfile for credit-bureau-new with conditional user creation
# 1) Runtime image: lightweight ASP.NET
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

# Define non-root user
ARG APP_USER=app
ARG APP_UID=1000
RUN id -u ${APP_USER} 2>/dev/null \
    || adduser --disabled-password --gecos "" --uid ${APP_UID} ${APP_USER}

WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
USER ${APP_USER}

# 2) Build image: compile application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy project and restore dependencies
COPY credit-bureau-new.csproj ./
RUN dotnet restore

# Copy source code and publish
COPY . .
RUN dotnet publish -c ${BUILD_CONFIGURATION} -o /app/publish /p:UseAppHost=false

# 3) Final image: deploy published app
FROM runtime AS final
WORKDIR /app
COPY --from=build /app/publish ./

ENTRYPOINT ["dotnet", "credit-bureau-new.dll"]
