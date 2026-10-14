using ChefCopilot.Application.Common.Interfaces;
using ChefCopilot.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Dishes.Commands;

public class UpdateDishIngredientDto
{
    public Guid IngredientId { get; set; }
    public decimal Quantity { get; set; }
}

public class UpdateDishCommand : IRequest
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;

    // Lista de ingredientes actualizada que forman la receta del plato
    public List<UpdateDishIngredientDto> Ingredients { get; set; } = new();
}

public class UpdateDishCommandHandler : IRequestHandler<UpdateDishCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateDishCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateDishCommand request, CancellationToken cancellationToken)
    {
        // 1. Buscamos el plato en la base de datos
        var dish = await _context.Dishes.FindAsync(new object[] { request.Id }, cancellationToken);

        if (dish == null)
        {
            throw new Exception($"El plato con ID {request.Id} no existe.");
        }

        dish.Name = request.Name;
        dish.Description = request.Description;
        dish.Category = request.Category;

        // 2. Buscamos y eliminamos los ingredientes existentes de la receta
        var existingIngredients = await _context.DishIngredients
            .Where(di => di.DishId == request.Id)
            .ToListAsync(cancellationToken);

        if (existingIngredients.Any())
        {
            _context.DishIngredients.RemoveRange(existingIngredients);
        }

        // 3. Añadimos la nueva receta de ingredientes
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

        await _context.SaveChangesAsync(cancellationToken);
    }
}
