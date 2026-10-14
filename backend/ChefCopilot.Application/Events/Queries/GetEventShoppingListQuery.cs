using ChefCopilot.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Events.Queries;

public class EventShoppingListDto
{
    public Guid EventId { get; set; }
    public string EventName { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public int Guests { get; set; }
    public int TotalDishes { get; set; }
    public List<ShoppingListItemDto> Items { get; set; } = new();
}

public class ShoppingListItemDto
{
    public Guid IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public string UnitOfMeasure { get; set; } = string.Empty;

    // Cantidad neta exacta que comerán los invitados (sin mermas)
    public decimal TotalNetQuantity { get; set; }

    // Porcentaje de merma del ingrediente (ej: 0.20 para 20%)
    public decimal WastePercentage { get; set; }

    // Cantidad bruta real que el restaurante debe pedir al proveedor
    public decimal TotalGrossQuantityToBuy { get; set; }

    public string DefaultProvider { get; set; } = string.Empty;
    public List<string> Allergens { get; set; } = new();
    public bool IsVegetarian { get; set; }
    public bool IsVegan { get; set; }

    // En qué platos del menú se utiliza este ingrediente
    public List<string> UsedInDishes { get; set; } = new();
}

public class GetEventShoppingListQuery : IRequest<EventShoppingListDto?>
{
    public Guid EventId { get; set; }
}

public class GetEventShoppingListQueryHandler : IRequestHandler<GetEventShoppingListQuery, EventShoppingListDto?>
{
    private readonly IApplicationDbContext _context;

    public GetEventShoppingListQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EventShoppingListDto?> Handle(GetEventShoppingListQuery request, CancellationToken cancellationToken)
    {
        // 1. Cargamos el evento con todos sus platos, las recetas de cada plato y sus ingredientes
        var @event = await _context.Events
            .Include(e => e.MenuDishes)
                .ThenInclude(d => d.Ingredients)
                    .ThenInclude(di => di.Ingredient)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == request.EventId, cancellationToken);

        if (@event == null)
        {
            return null;
        }

        var shoppingList = new EventShoppingListDto
        {
            EventId = @event.Id,
            EventName = @event.Name,
            EventDate = @event.EventDate,
            Guests = @event.StandardGuests,
            TotalDishes = @event.MenuDishes.Count
        };

        // 2. Diccionario temporal para consolidar ingredientes repetidos entre distintos platos
        var ingredientAggregates = new Dictionary<Guid, (
            Domain.Entities.Ingredient Ingredient,
            decimal TotalNetQuantity,
            HashSet<string> Dishes
        )>();

        foreach (var dish in @event.MenuDishes)
        {
            foreach (var dishIngredient in dish.Ingredients)
            {
                var ingredient = dishIngredient.Ingredient;
                if (ingredient == null) continue;

                // Cantidad neta requerida para este plato = porción por persona * número de comensales
                var dishNetQuantity = dishIngredient.Quantity * @event.StandardGuests;

                if (ingredientAggregates.TryGetValue(ingredient.Id, out var existing))
                {
                    existing.TotalNetQuantity += dishNetQuantity;
                    existing.Dishes.Add(dish.Name);
                    ingredientAggregates[ingredient.Id] = existing;
                }
                else
                {
                    var dishesSet = new HashSet<string> { dish.Name };
                    ingredientAggregates[ingredient.Id] = (ingredient, dishNetQuantity, dishesSet);
                }
            }
        }

        // 3. Calculamos la merma y construimos la lista final
        foreach (var kvp in ingredientAggregates)
        {
            var ingredient = kvp.Value.Ingredient;
            var netQuantity = kvp.Value.TotalNetQuantity;

            // Normalizamos el porcentaje de merma (por si se guardó como 20 en vez de 0.20)
            var waste = ingredient.WastePercentage;
            var normalizedWaste = waste > 1m && waste <= 100m ? waste / 100m : waste;

            // Fórmula de escandallo profesional de cocina:
            // Bruto = Neto / (1 - Merma)
            decimal grossQuantity = netQuantity;
            if (normalizedWaste > 0 && normalizedWaste < 1.0m)
            {
                grossQuantity = netQuantity / (1.0m - normalizedWaste);
            }

            shoppingList.Items.Add(new ShoppingListItemDto
            {
                IngredientId = ingredient.Id,
                IngredientName = ingredient.Name,
                UnitOfMeasure = ingredient.UnitOfMeasure,
                TotalNetQuantity = Math.Round(netQuantity, 3),
                WastePercentage = Math.Round(normalizedWaste, 4),
                TotalGrossQuantityToBuy = Math.Round(grossQuantity, 3),
                DefaultProvider = ingredient.DefaultProvider,
                Allergens = ingredient.Allergens ?? new List<string>(),
                IsVegetarian = ingredient.IsVegetarian,
                IsVegan = ingredient.IsVegan,
                UsedInDishes = kvp.Value.Dishes.OrderBy(d => d).ToList()
            });
        }

        // Ordenamos alfabéticamente por nombre de ingrediente
        shoppingList.Items = shoppingList.Items.OrderBy(i => i.IngredientName).ToList();

        return shoppingList;
    }
}
