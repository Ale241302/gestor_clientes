using api_back.Data;
using api_back.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_back.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContactosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/contactos/cliente/5
        [HttpGet("cliente/{clienteId}")]
        public async Task<ActionResult<IEnumerable<Contacto>>> ObtenerContactosPorCliente(int clienteId)
        {
            return await _context.Contactos
                .Where(c => c.ClienteId == clienteId)
                .ToListAsync();
        }

        // GET: api/contactos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Contacto>> ObtenerContactoPorId(int id)
        {
            var contacto = await _context.Contactos.FindAsync(id);

            if (contacto == null)
            {
                return NotFound();
            }

            return contacto;
        }

        // POST: api/contactos
        [HttpPost]
        public async Task<ActionResult<Contacto>> CrearContacto(Contacto contacto)
        {
            // Validar que el cliente exista
            if (!_context.Clientes.Any(c => c.Id == contacto.ClienteId))
            {
                return BadRequest("El Cliente especificado no existe.");
            }

            _context.Contactos.Add(contacto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerContactoPorId), new { id = contacto.Id }, contacto);
        }

        // PUT: api/contactos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarContacto(int id, Contacto contacto)
        {
            if (id != contacto.Id)
            {
                return BadRequest();
            }

            _context.Entry(contacto).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ContactoExists(id))
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

        // DELETE: api/contactos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarContacto(int id)
        {
            var contacto = await _context.Contactos.FindAsync(id);
            if (contacto == null)
            {
                return NotFound();
            }

            _context.Contactos.Remove(contacto);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ContactoExists(int id)
        {
            return _context.Contactos.Any(e => e.Id == id);
        }
    }
}
