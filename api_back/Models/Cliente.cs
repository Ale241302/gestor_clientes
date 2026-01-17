using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_back.Models
{
    public class Cliente
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string NombreCompleto { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Direccion { get; set; }

        [MaxLength(20)]
        public string? Telefono { get; set; }

        [Required]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        // Propiedad de navegación
        public List<Contacto> Contactos { get; set; } = new List<Contacto>();
    }
}
