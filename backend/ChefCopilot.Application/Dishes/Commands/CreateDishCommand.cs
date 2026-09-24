using ChefCopilot.Application.Common.Interfaces;
using ChefCopilot.Domain.Entities;
using MediatR;

namespace ChefCopilot.Application.Dishes.Commands;

// Un "sub-modelo" para que el frontend nos pase el ID del ingrediente y la cantidad
public class CreateDishIngredientDto
{
    public Guid IngredientId { get; set; }
    public decimal Quantity { get; set; }
}

public class CreateDishCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    
    // Lista de ingredientes que forman la receta de este plato
    public List<CreateDishIngredientDto> Ingredients { get; set; } = new();
}

public class CreateDishCommandHandler : IRequestHandler<CreateDishCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateDishCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateDishCommand request, CancellationToken cancellationToken)
    {
        // 1. Creamos el plato principal en blanco
        var dish = new Dish
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Category = request.Category
        };

        _context.Dishes.Add(dish);

        // 2. Repasamos la lista de la compra (los ingredientes de la receta)
        foreach (var item in request.Ingredients)
        {
            var dishIngredient = new DishIngredient
            {
                Id = Guid.NewGuid(),
                DishId = dish.Id,
                IngredientId = item.IngredientId,
                Quantity = item.Quantity
            };
            
            _context.DishIngredients.Add(dishIngredient);
        }

        // 3. Entity Framework guarda el Plato y TODOS sus ingredientes de golpe (es una Transacción)
        await _context.SaveChangesAsync(cancellationToken);

        return dish.Id;
    }
}
