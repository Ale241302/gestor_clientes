-- Archivo: SQL/setup.sql
-- Descripción: Script de creación de tablas para Gestor de Clientes

-- Crear tabla Clientes
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Clientes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Clientes](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [NombreCompleto] [nvarchar](200) NOT NULL,
        [Direccion] [nvarchar](500) NULL,
        [Telefono] [nvarchar](20) NULL,
        [FechaCreacion] [datetime] NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_Clientes] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

-- Crear tabla Contactos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Contactos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Contactos](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [ClienteId] [int] NOT NULL,
        [NombreCompleto] [nvarchar](200) NOT NULL,
        [Direccion] [nvarchar](500) NULL,
        [Telefono] [nvarchar](20) NULL,
        CONSTRAINT [PK_Contactos] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
    
    -- Agregar Foreign Key
    ALTER TABLE [dbo].[Contactos]  WITH CHECK ADD  CONSTRAINT [FK_Contactos_Clientes] FOREIGN KEY([ClienteId])
    REFERENCES [dbo].[Clientes] ([Id])
    ON DELETE CASCADE;
    
    ALTER TABLE [dbo].[Contactos] CHECK CONSTRAINT [FK_Contactos_Clientes];
END
GO
