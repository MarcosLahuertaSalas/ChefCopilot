using ChefCopilot.Application.Common.Interfaces;
using ChefCopilot.Domain.Entities;
using MediatR;

namespace ChefCopilot.Application.Ingredients.Commands;

// 1. EL COMANDO (La Petición)
// Esta es la "cajita" de datos que envía el frontend (Angular) o la API.
public class CreateIngredientCommand : IRequest<Guid>
{
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
    public bool IsVegetarian { get; set; } = false;
    public bool IsVegan { get; set; } = false;
}

// 2. EL HANDLER (El Trabajador)
// Esta clase atrapa la cajita y hace el trabajo duro con la base de datos.
public class CreateIngredientCommandHandler : IRequestHandler<CreateIngredientCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateIngredientCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateIngredientCommand request, CancellationToken cancellationToken)
    {
        // Convertimos el "Comando" (Dato crudo) en nuestra "Entidad de Dominio" (Pieza de lego)
        var entity = new Ingredient
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            UnitOfMeasure = request.UnitOfMeasure,
            WastePercentage = request.WastePercentage,
            ReusableWastePercentage = request.ReusableWastePercentage,
            CurrentStock = request.CurrentStock,
            MinimumStock = request.MinimumStock,
            IsPurchasedByPiece = request.IsPurchasedByPiece,
            MinPortionsPerPiece = request.MinPortionsPerPiece,
            MaxPortionsPerPiece = request.MaxPortionsPerPiece,
            DefaultProvider = string.IsNullOrWhiteSpace(request.DefaultProvider) ? "Sin asignar" : request.DefaultProvider,
            Allergens = request.Allergens ?? new List<string>(),
            IsVegetarian = request.IsVegetarian,
            IsVegan = request.IsVegan
        };

        // Lo mandamos a la base de datos
        _context.Ingredients.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        // Devolvemos la ID para que el frontend sepa que se ha creado con éxito
        return entity.Id;
    }
}
