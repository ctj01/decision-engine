# IdentityServer/Dockerfile

# 1) Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ../nuget.config ./
COPY ../nupkgs ./nupkgs

COPY ["IdentityServer/IdentityServer.csproj", "./"]
RUN dotnet restore "IdentityServer.csproj"

COPY IdentityServer/. ./
WORKDIR "/src"
RUN dotnet publish "IdentityServer.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 2) Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "IdentityServer.dll"]
