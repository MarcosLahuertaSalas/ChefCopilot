using ChefCopilot.Domain.Entities;
using ChefCopilot.Domain.Enums;
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
    public DbSet<EventDietaryRequirement> EventDietaryRequirements { get; set; } = null!;
    public DbSet<EventPostMortemItem> EventPostMortemItems { get; set; } = null!;
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

        // Configuración de la entidad Event
        modelBuilder.Entity<Event>(entity =>
        {
            entity.Property(e => e.Status)
                  .HasConversion<string>()
                  .HasMaxLength(30)
                  .HasDefaultValue(EventStatus.Planned);

            entity.Property(e => e.PostMortemNotes)
                  .HasMaxLength(1000);

            // Relación muchos a muchos: Un evento tiene varios platos en su menú
            entity.HasMany(e => e.MenuDishes)
                  .WithMany()
                  .UsingEntity(j => j.ToTable("EventDishes"));
        });

        // Excepciones dietéticas y menús especiales por banquete
        modelBuilder.Entity<EventDietaryRequirement>(entity =>
        {
            entity.HasOne(edr => edr.Event)
                  .WithMany(e => e.DietaryRequirements)
                  .HasForeignKey(edr => edr.EventId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(edr => edr.ReplacedDish)
                  .WithMany()
                  .HasForeignKey(edr => edr.ReplacedDishId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(edr => edr.SubstituteDish)
                  .WithMany()
                  .HasForeignKey(edr => edr.SubstituteDishId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.Property(edr => edr.RequirementName).HasMaxLength(150).IsRequired();
            entity.Property(edr => edr.Notes).HasMaxLength(500);
        });

        // Auditoría post-servicio de mermas reales
        modelBuilder.Entity<EventPostMortemItem>(entity =>
        {
            entity.HasOne(epm => epm.Event)
                  .WithMany(e => e.PostMortemItems)
                  .HasForeignKey(epm => epm.EventId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(epm => epm.Ingredient)
                  .WithMany()
                  .HasForeignKey(epm => epm.IngredientId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.Property(epm => epm.PlannedGrossQuantity).HasPrecision(18, 4);
            entity.Property(epm => epm.PlannedWastePercentage).HasPrecision(18, 4);
            entity.Property(epm => epm.PlannedWasteQuantity).HasPrecision(18, 4);
            entity.Property(epm => epm.PlannedReusablePercentage).HasPrecision(18, 4);
            entity.Property(epm => epm.PlannedReusableQuantity).HasPrecision(18, 4);
            entity.Property(epm => epm.ActualWasteQuantity).HasPrecision(18, 4);
            entity.Property(epm => epm.ActualReusableQuantity).HasPrecision(18, 4);
            entity.Property(epm => epm.ActualWastePercentage).HasPrecision(18, 4);
            entity.Property(epm => epm.ActualReusablePercentage).HasPrecision(18, 4);
            entity.Property(epm => epm.WasteDeviationPercentage).HasPrecision(18, 4);
            entity.Property(epm => epm.Notes).HasMaxLength(500);
        });
    }
}
