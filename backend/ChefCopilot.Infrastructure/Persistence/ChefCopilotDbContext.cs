using ChefCopilot.Domain.Entities;
using ChefCopilot.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Infrastructure.Persistence;

public class ChefCopilotDbContext : DbContext, IApplicationDbContext
{
    public ChefCopilotDbContext(DbContextOptions<ChefCopilotDbContext> options) : base(options)
    {
    }

    // Aquí le decimos a Entity Framework qué clases queremos que se conviertan en tablas
    public DbSet<Ingredient> Ingredients { get; set; } = null!;
    public DbSet<Dish> Dishes { get; set; } = null!;
    public DbSet<DishIngredient> DishIngredients { get; set; } = null!;
    public DbSet<Event> Events { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Índice único para el email de usuarios
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).HasMaxLength(150).IsRequired();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.FullName).HasMaxLength(100).IsRequired();
            entity.Property(u => u.RestaurantName).HasMaxLength(100);
            entity.Property(u => u.Role).HasMaxLength(50).HasDefaultValue("Chef");
        });

        // Relación muchos a muchos: Un evento tiene varios platos en su menú, 
        // y un plato del catálogo puede formar parte de varios eventos.
        modelBuilder.Entity<Event>()
            .HasMany(e => e.MenuDishes)
            .WithMany()
            .UsingEntity(j => j.ToTable("EventDishes"));
    }
}
