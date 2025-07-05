# Stage 1: runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
# Make Kestrel listen on port 80
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

# Stage 2: build + publish
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# 1) Copy only the .csproj files (speeds up cache on rebuilds)
COPY ["LoanService.Api/LoanService.Api.csproj", "LoanService.Api/"]
COPY ["LoanService.Infrastructure/LoanService.Infrastructure.csproj", "LoanService.Infrastructure/"]
COPY ["LoanService.Core/LoanService.Core.csproj", "LoanService.Core/"]
COPY ["LoanService.Application/LoanService.Application.csproj", "LoanService.Application/"]

# 2) Restore dependencies
RUN dotnet restore "LoanService.Api/LoanService.Api.csproj"

# 3) Copy the rest of the source code
COPY . .

# 4) Build the API project
WORKDIR "/src/LoanService.Api"
RUN dotnet build "LoanService.Api.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/build

# 5) Publish the API (self-contained=false, no native host)
FROM build AS publish
RUN dotnet publish "LoanService.Api.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false

# Stage 3: final image
FROM base AS final
WORKDIR /app

# Copy the published output into the runtime image
COPY --from=publish /app/publish .

# Start the API
ENTRYPOINT ["dotnet", "LoanService.Api.dll"]
