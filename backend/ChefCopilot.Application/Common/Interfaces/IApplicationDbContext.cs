using ChefCopilot.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Common.Interfaces;

// Esta interfaz es VITAL en Clean Architecture.
// Le dice a la capa de Aplicación qué tablas existen, pero SIN obligarla a saber 
// si debajo hay MySQL, SQL Server o un archivo de texto.
public interface IApplicationDbContext
{
    DbSet<Ingredient> Ingredients { get; }
    DbSet<Dish> Dishes { get; }
    DbSet<DishIngredient> DishIngredients { get; }
    DbSet<Event> Events { get; }
    DbSet<User> Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
