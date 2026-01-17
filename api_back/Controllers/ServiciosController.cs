using api_back.Data;
using api_back.Models;
using Microsoft.AspNetCore.Mvc;

namespace api_back.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiciosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServiciosController(AppDbContext context)
        {
            _context = context;
        }

        public class CrearContactoRequest
        {
            public int ClienteId { get; set; }
            public string NombreCompleto { get; set; } = string.Empty;
            public string? Direccion { get; set; }
            public string? Telefono { get; set; }
        }

        // POST: api/servicios/crear-contacto
        [HttpPost("crear-contacto")]
        public async Task<IActionResult> CrearContacto([FromBody] CrearContactoRequest request)
        {
            if (request == null) return BadRequest("Datos inválidos");

            try
            {
                // Verificar cliente
                var cliente = await _context.Clientes.FindAsync(request.ClienteId);
                if (cliente == null)
                {
                    return Ok(new { exito = false, mensaje = "Cliente no encontrado" });
                }

                // Crear contacto
                var nuevoContacto = new Contacto
                {
                    ClienteId = request.ClienteId,
                    NombreCompleto = request.NombreCompleto,
                    Direccion = request.Direccion,
                    Telefono = request.Telefono
                };

                _context.Contactos.Add(nuevoContacto);
                await _context.SaveChangesAsync();

                return Ok(new { exito = true, mensaje = "Contacto creado exitosamente", contactoId = nuevoContacto.Id });
            }
            catch (Exception ex)
            {
                return Ok(new { exito = false, mensaje = "Error interno: " + ex.Message });
            }
        }
    }
}
