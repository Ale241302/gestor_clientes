# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["api_back.csproj", "./"]
RUN dotnet restore "api_back.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "api_back.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "api_back.csproj" -c Release -o /app/publish

# Final Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "api_back.dll"]
