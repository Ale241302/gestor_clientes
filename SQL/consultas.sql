-- Archivo: SQL/consultas.sql
-- Descripción: Consultas requeridas para el sistema Gestor de Clientes

-- a. Clientes cuyos contactos tienen nombre que empieza con "carl"
SELECT DISTINCT c.*
FROM Clientes c
INNER JOIN Contactos cont ON c.Id = cont.ClienteId
WHERE cont.NombreCompleto LIKE 'carl%';

-- b. Clientes ordenados ascendentemente por fecha de creación
SELECT *
FROM Clientes
ORDER BY FechaCreacion ASC;

-- c. Clientes con más de un contacto
SELECT c.Id, c.NombreCompleto, COUNT(cont.Id) as TotalContactos
FROM Clientes c
JOIN Contactos cont ON c.Id = cont.ClienteId
GROUP BY c.Id, c.NombreCompleto
HAVING COUNT(cont.Id) > 1;

-- d. Eliminar contactos de un cliente específico
-- (Reemplazar @ClienteId con el Id deseado)
DELETE FROM Contactos
WHERE ClienteId = @ClienteId;

-- e. Eliminar clientes sin contactos
-- Opción 1: Usando NOT EXISTS
DELETE FROM Clientes
WHERE NOT EXISTS (
    SELECT 1 FROM Contactos WHERE Contactos.ClienteId = Clientes.Id
);

-- Opción 2: Usando LEFT JOIN
-- DELETE c
-- FROM Clientes c
-- LEFT JOIN Contactos cont ON c.Id = cont.ClienteId
-- WHERE cont.Id IS NULL;

-- f. Insertar cliente con contacto en una transacción
BEGIN TRANSACTION;

BEGIN TRY
    -- Declarar variables para ids
    DECLARE @NuevoClienteId int;

    -- 1. Insertar Cliente
    INSERT INTO Clientes (NombreCompleto, Direccion, Telefono)
    VALUES ('Nuevo Cliente Transaccional', 'Calle Falsa 123', '555-0000');
    
    -- Obtener el ID generado
    SET @NuevoClienteId = SCOPE_IDENTITY();

    -- 2. Insertar Contacto asociado
    INSERT INTO Contactos (ClienteId, NombreCompleto, Direccion, Telefono)
    VALUES (@NuevoClienteId, 'Contacto Principal', 'Misma direccion', '555-1111');

    COMMIT TRANSACTION;
    PRINT 'Transacción completada con éxito.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Error en la transacción. Se han revertido los cambios.';
    -- Opcional: Mostrar error
    -- SELECT ERROR_MESSAGE() AS ErrorMessage;
END CATCH;
