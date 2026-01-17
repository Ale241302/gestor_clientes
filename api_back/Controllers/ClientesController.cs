using api_back.Data;
using api_back.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_back.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ClientesController> _logger;

        public ClientesController(AppDbContext context, ILogger<ClientesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/clientes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> ObtenerTodosLosClientes()
        {
            try
            {
                return await _context.Clientes.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener clientes");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // GET: api/clientes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Cliente>> ObtenerClientePorId(int id)
        {
            var cliente = await _context.Clientes.FindAsync(id);

            if (cliente == null)
            {
                return NotFound();
            }

            return cliente;
        }

        // POST: api/clientes
        [HttpPost]
        public async Task<ActionResult<Cliente>> CrearCliente(Cliente cliente)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _context.Clientes.Add(cliente);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(ObtenerClientePorId), new { id = cliente.Id }, cliente);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear cliente");
                return StatusCode(500, "Error al guardar el cliente");
            }
        }

        // PUT: api/clientes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarCliente(int id, Cliente cliente)
        {
            if (id != cliente.Id)
            {
                return BadRequest("El ID del cliente no coincide");
            }

            _context.Entry(cliente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClienteExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/clientes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarCliente(int id)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null)
            {
                return NotFound();
            }

            _context.Clientes.Remove(cliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/clientes/buscar?nombre=...&telefono=...
        [HttpGet("buscar")]
        public async Task<ActionResult<IEnumerable<Cliente>>> BuscarClientes([FromQuery] string? nombre, [FromQuery] string? telefono)
        {
            var query = _context.Clientes.AsQueryable();

            if (!string.IsNullOrEmpty(nombre))
            {
                query = query.Where(c => c.NombreCompleto.Contains(nombre));
            }

            if (!string.IsNullOrEmpty(telefono))
            {
                query = query.Where(c => c.Telefono != null && c.Telefono.Contains(telefono));
            }

            return await query.ToListAsync();
        }

        // GET: api/clientes/ordenar?campo=FechaCreacion&orden=asc
        [HttpGet("ordenar")]
        public async Task<ActionResult<IEnumerable<Cliente>>> OrdenarClientes([FromQuery] string campo, [FromQuery] string orden = "asc")
        {
            var query = _context.Clientes.AsQueryable();

            if (campo.Equals("FechaCreacion", StringComparison.OrdinalIgnoreCase))
            {
                if (orden.Equals("desc", StringComparison.OrdinalIgnoreCase))
                    query = query.OrderByDescending(c => c.FechaCreacion);
                else
                    query = query.OrderBy(c => c.FechaCreacion);
            }
            else if (campo.Equals("NombreCompleto", StringComparison.OrdinalIgnoreCase))
            {
                 if (orden.Equals("desc", StringComparison.OrdinalIgnoreCase))
                    query = query.OrderByDescending(c => c.NombreCompleto);
                else
                    query = query.OrderBy(c => c.NombreCompleto);
            }
            
            return await query.ToListAsync();
        }

        private bool ClienteExists(int id)
        {
            return _context.Clientes.Any(e => e.Id == id);
        }
    }
}
