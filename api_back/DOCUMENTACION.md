# Documentación del Backend

## Arquitectura
La API sigue una arquitectura de n-capas simplificada en un proyecto Web API de ASP.NET Core 8.0.
- **Controllers**: Manejan las peticiones HTTP y la lógica de presentación.
- **Data (DbContext)**: Capa de acceso a datos usando Entity Framework Core.
- **Models**: Defines las entidades de negocio.

Se eligió esta estructura por ser estándar en .NET, fácil de mantener y escalar para este tamaño de proyecto.

## Endpoints

### Clientes
- `GET /api/clientes`: Retorna lista de todos los clientes.
- `GET /api/clientes/{id}`: Detalle de un cliente específico.
- `POST /api/clientes`: Crea un nuevo cliente.
  - JSON: `{ "nombreCompleto": "Ejemplo" ... }`
- `PUT /api/clientes/{id}`: Actualiza un cliente.
- `DELETE /api/clientes/{id}`: Elimina cliente y sus contactos (Cascade).
- `GET /api/clientes/buscar`: Filtra por `nombre` y `telefono`.

### Contactos
- `GET /api/contactos/cliente/{clienteId}`: Obtiene contactos de un cliente.
- `POST /api/contactos`: Crea un contacto asociado a un cliente.

### Servicios
- `POST /api/servicios/crear-contacto`: Endpoint especial solicitado.
  - Recibe objeto plano con `clienteId` y datos de contacto.
  - Lógica encapsulada para validación y creación.

## Tipos de Datos
- **Ids**: `int` (Identity) para indexación eficiente en SQL Server.
- **Cadenas**: `nvarchar` para soporte Unicode.
- **Fechas**: `datetime` para registro de auditoría simple.
