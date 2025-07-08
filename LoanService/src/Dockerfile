# Decision-Engine/LoanService/src/Dockerfile

# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# 1.1) Local NuGet feed
COPY ../../nuget.config ./
COPY ../../nupkgs ./nupkgs

# 1.2) Copy csproj files only and restore dependencies
COPY ["LoanService/src/LoanService.Api/LoanService.Api.csproj",           "LoanService.Api/"]
COPY ["LoanService/src/LoanService.Application/LoanService.Application.csproj", "LoanService.Application/"]
COPY ["LoanService/src/LoanService.Infrastructure/LoanService.Infrastructure.csproj", "LoanService.Infrastructure/"]
COPY ["LoanService/src/LoanService.Core/LoanService.Core.csproj",         "LoanService.Core/"]
RUN dotnet restore "LoanService.Api/LoanService.Api.csproj"

# 1.3) Copy source code
COPY ["LoanService/src/LoanService.Api",           "LoanService.Api/"]
COPY ["LoanService/src/LoanService.Application",   "LoanService.Application/"]
COPY ["LoanService/src/LoanService.Infrastructure","LoanService.Infrastructure/"]
COPY ["LoanService/src/LoanService.Core",          "LoanService.Core/"]

# Stage 2: Publish
WORKDIR "/src/LoanService.Api"
RUN dotnet publish "LoanService.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "LoanService.Api.dll"]
