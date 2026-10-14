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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Relación muchos a muchos: Un evento tiene varios platos en su menú, 
        // y un plato del catálogo puede formar parte de varios eventos.
        modelBuilder.Entity<Event>()
            .HasMany(e => e.MenuDishes)
            .WithMany()
            .UsingEntity(j => j.ToTable("EventDishes"));
    }
}
