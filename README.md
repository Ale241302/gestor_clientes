# Gestor de Clientes

Aplicación web completa para la gestión de clientes y contactos, desarrollada con ASP.NET Core 8.0 y JavaScript Vanilla.

## Tecnologías
- **Backend**: ASP.NET Core 8.0 Web API, Entity Framework Core 8.
- **Frontend**: HTML5, CSS3 (Glassmorphism), JavaScript (Vanilla).
- **Base de Datos**: SQL Server.

## Estructura del Proyecto
- `/api_back`: Código fuente del API REST.
- `/frontend`: Código fuente del cliente web.
- `/SQL`: Scripts de base de datos y diagramas.

## Instalación y Ejecución

### 1. Base de Datos
1.  Asegúrate de tener SQL Server (o LocalDB) instalado.
2.  Ejecuta el script `SQL/setup.sql` para crear las tablas necesarias.
     ```json
    "sqlcmd -S "(localdb)\mssqllocaldb" -Q "CREATE DATABASE GestorClientesDB""
    ```
     ```json
    "sqlcmd -S "(localdb)\mssqllocaldb" -d GestorClientesDB -i setup.sql"
    ```
3.  Verifica la cadena de conexión en `api_back/appsettings.json`. Por defecto usa LocalDB:
    ```json
    "Server=(localdb)\\mssqllocaldb;Database=GestorClientesDB;Trusted_Connection=True;..."
    ```

### 2. Backend
1.  Navega a la carpeta del backend:
    ```powershell
    cd api_back
    ```
2.  Restaura los paquetes y ejecuta la aplicación:
    ```powershell
    dotnet restore
    dotnet run
    ```
3.  La API iniciará en `http://localhost:5135` (o el puerto configurado).

### 3. Frontend
1.  Navega a la carpeta del frontend:
    ```powershell
    cd frontend
    ```
2.  Puedes abrir directamente el archivo `index.html` en tu navegador.
3.  Opcional (recomendado): Usa un servidor local simple:
    ```powershell
    npx http-server .
    ```

## Documentación
- [Backend Docs](api_back/DOCUMENTACION.md)
- [Frontend Docs](frontend/DOCUMENTACION.md)
- [Diagrama MER](SQL/diagrama_mer.png)

## Funcionalidades
- CRUD completo de Clientes y Contactos.
- Filtros de búsqueda y ordenamiento.
- Diseño Moderno y Responsive (Mobile First).
- Servicio especial de creación rápida de contactos.
