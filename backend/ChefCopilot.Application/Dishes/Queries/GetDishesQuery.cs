using ChefCopilot.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Dishes.Queries;

// Creamos un DTO para la respuesta y no mandar la base de datos cruda (evitar bucles infinitos al leer JSON)
public class DishDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public List<DishIngredientResponseDto> Ingredients { get; set; } = new();
}

public class DishIngredientResponseDto
{
    public Guid IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
}

public class GetDishesQuery : IRequest<List<DishDto>> { }

public class GetDishesQueryHandler : IRequestHandler<GetDishesQuery, List<DishDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDishesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DishDto>> Handle(GetDishesQuery request, CancellationToken cancellationToken)
    {
        // Traemos todos los platos y además INCLUIMOS la tabla intermedia y el propio ingrediente
        return await _context.Dishes
            .Include(d => d.Ingredients)
            .ThenInclude(di => di.Ingredient) 
            .Select(d => new DishDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                Category = d.Category,
                Ingredients = d.Ingredients.Select(di => new DishIngredientResponseDto
                {
                    IngredientId = di.IngredientId,
                    IngredientName = di.Ingredient.Name,
                    Quantity = di.Quantity
                }).ToList()
            })
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}
