using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace api_back.Models
{
    public class Contacto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ClienteId { get; set; }

        [Required]
        [MaxLength(200)]
        public string NombreCompleto { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Direccion { get; set; }

        [MaxLength(20)]
        public string? Telefono { get; set; }

        // Propiedad de navegación
        [ForeignKey("ClienteId")]
        [JsonIgnore] // Para evitar ciclos en JSON
        public Cliente? Cliente { get; set; }
    }
}
