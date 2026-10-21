using ChefCopilot.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Ingredient> Ingredients { get; }
    DbSet<Dish> Dishes { get; }
    DbSet<DishIngredient> DishIngredients { get; }
    DbSet<Event> Events { get; }
    DbSet<EventDietaryRequirement> EventDietaryRequirements { get; }
    DbSet<EventPostMortemItem> EventPostMortemItems { get; }
    DbSet<User> Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
