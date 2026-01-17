# Diagrama de Entidad-Relación (MER)

```mermaid
erDiagram
    CLIENTES ||--|{ CONTACTOS : tiene
    CLIENTES {
        int Id PK "Identity"
        nvarchar(200) NombreCompleto "NOT NULL"
        nvarchar(500) Direccion
        nvarchar(20) Telefono
        datetime FechaCreacion "DEFAULT GETDATE()"
    }
    CONTACTOS {
        int Id PK "Identity"
        int ClienteId FK "Ref: Clientes.Id"
        nvarchar(200) NombreCompleto "NOT NULL"
        nvarchar(500) Direccion
        nvarchar(20) Telefono
    }
```

## Descripción de Tablas

### Tabla: Clientes
Almacena la información principal de los clientes.
- **Id**: Identificador único autoincremental.
- **NombreCompleto**: Nombre completo del cliente (Obligatorio).
- **Direccion**: Dirección física.
- **Telefono**: Número de contacto.
- **FechaCreacion**: Fecha de registro del cliente (Automático).

### Tabla: Contactos
Almacena los contactos asociados a un cliente específico.
- **Id**: Identificador único autoincremental.
- **ClienteId**: Clave foránea que relaciona con la tabla Clientes.
- **NombreCompleto**: Nombre del contacto (Obligatorio).
- **Direccion**: Dirección del contacto.
- **Telefono**: Teléfono del contacto.
