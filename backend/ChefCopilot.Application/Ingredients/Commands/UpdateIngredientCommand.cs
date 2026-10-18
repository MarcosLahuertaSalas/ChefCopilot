using ChefCopilot.Application.Common.Interfaces;
using MediatR;

namespace ChefCopilot.Application.Ingredients.Commands;

public class UpdateIngredientCommand : IRequest
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string UnitOfMeasure { get; set; } = string.Empty;
    public decimal WastePercentage { get; set; }
    public decimal ReusableWastePercentage { get; set; }
    public decimal CurrentStock { get; set; }
    public decimal MinimumStock { get; set; }
    public bool IsPurchasedByPiece { get; set; }
    public int? MinPortionsPerPiece { get; set; }
    public int? MaxPortionsPerPiece { get; set; }
    public string DefaultProvider { get; set; } = string.Empty;
    public List<string> Allergens { get; set; } = new();
    public bool IsVegetarian { get; set; }
    public bool IsVegan { get; set; }
}

public class UpdateIngredientCommandHandler : IRequestHandler<UpdateIngredientCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateIngredientCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateIngredientCommand request, CancellationToken cancellationToken)
    {
        // 1. Buscamos el ingrediente en la base de datos
        var entity = await _context.Ingredients.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null)
        {
            // Aquí podríamos lanzar una excepción personalizada como NotFoundException
            throw new Exception($"El ingrediente con ID {request.Id} no existe.");
        }

        // 2. Le cambiamos los datos
        entity.Name = request.Name;
        entity.UnitOfMeasure = request.UnitOfMeasure;
        entity.WastePercentage = request.WastePercentage;
        entity.ReusableWastePercentage = request.ReusableWastePercentage;
        entity.CurrentStock = request.CurrentStock;
        entity.MinimumStock = request.MinimumStock;
        entity.IsPurchasedByPiece = request.IsPurchasedByPiece;
        entity.MinPortionsPerPiece = request.MinPortionsPerPiece;
        entity.MaxPortionsPerPiece = request.MaxPortionsPerPiece;
        entity.DefaultProvider = request.DefaultProvider;
        entity.Allergens = request.Allergens ?? new List<string>();
        entity.IsVegetarian = request.IsVegetarian;
        entity.IsVegan = request.IsVegan;

        // 3. Guardamos los cambios
        await _context.SaveChangesAsync(cancellationToken);
    }
}
