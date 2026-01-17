using api_back.Models;
using Microsoft.EntityFrameworkCore;

namespace api_back.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Contacto> Contactos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuraciones adicionales si son necesarias
            modelBuilder.Entity<Cliente>()
                .Property(c => c.FechaCreacion)
                .HasDefaultValueSql("GETDATE()");

            // Relación uno a muchos
            modelBuilder.Entity<Contacto>()
                .HasOne(c => c.Cliente)
                .WithMany(cl => cl.Contactos)
                .HasForeignKey(c => c.ClienteId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
