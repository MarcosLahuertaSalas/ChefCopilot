using ChefCopilot.Application.Common.Interfaces;
using ChefCopilot.Application.Events.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Events.Queries;

public class DishPortionBreakdownDto
{
    public Guid DishId { get; set; }
    public string DishName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsMenuDish { get; set; }
    public int StandardPortions { get; set; }
    public int SubstitutedOutPortions { get; set; }
    public int SpecialPortions { get; set; }
    public int TotalPortionsToCook { get; set; }
    public List<string> SpecialRequirementNotes { get; set; } = new();
}

public class EventShoppingListDto
{
    public Guid EventId { get; set; }
    public string EventName { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public int Guests { get; set; }
    public int StandardGuests { get; set; }
    public int DietaryGuests { get; set; }
    public int TotalDishes { get; set; }
    public int TotalStockAlerts { get; set; }
    public decimal TotalEstimatedReusableTrimmings { get; set; }
    public List<EventDietaryRequirementDto> DietaryRequirements { get; set; } = new();
    public List<DishPortionBreakdownDto> DishBreakdown { get; set; } = new();
    public List<ShoppingListItemDto> Items { get; set; } = new();
}

public class ShoppingListItemDto
{
    public Guid IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public string UnitOfMeasure { get; set; } = string.Empty;

    // Cantidad neta exacta consumida en las recetas (sin merma)
    public decimal TotalNetQuantity { get; set; }

    // Porcentaje de desperdicio técnico (basura pura: grasa inutilizable, pieles no comestibles)
    public decimal WastePercentage { get; set; }

    // Porcentaje de merma técnica aprovechable (recortes para albóndigas, huesos para caldos)
    public decimal ReusableWastePercentage { get; set; }

    // Merma total combinada
    public decimal TotalWastePercentage { get; set; }

    // Cantidad bruta total requerida para cocinar
    public decimal TotalGrossQuantityRequired { get; set; }

    // Stock actual en cámara/almacén
    public decimal CurrentStock { get; set; }

    // Stock mínimo de seguridad
    public decimal MinimumStock { get; set; }

    // Cantidad neta que realmente hay que comprar (Bruto Requerido - Stock en Cámara)
    public decimal QuantityToBuy { get; set; }

    // Stock remanente proyectado tras el evento
    public decimal ProjectedStockAfterEvent { get; set; }

    // Aviso si el stock está o quedará por debajo del mínimo de seguridad
    public bool IsLowStockAlert { get; set; }
    public string? LowStockMessage { get; set; }

    // Subproductos aprovechables estimados (ej: 2.5 Kg de carne picada / recortes)
    public decimal EstimatedReusableQuantity { get; set; }

    // Desperdicio neto no aprovechable
    public decimal EstimatedNetTrashQuantity { get; set; }

    // --- CÁLCULO DE COMPRA POR PIEZAS ENTERAS (Rendimiento del Chef) ---
    public bool IsPurchasedByPiece { get; set; }
    public int? MinPortionsPerPiece { get; set; }
    public int? MaxPortionsPerPiece { get; set; }
    public int TotalPortionsRequired { get; set; }
    public int? PiecesToBuy { get; set; }
    public int? EstimatedMinPortionsYield { get; set; }
    public int? EstimatedMaxPortionsYield { get; set; }
    public int? EstimatedSurplusPortions { get; set; }

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
        // 1. Cargamos el evento con su menú, recetas e ingredientes, más los requerimientos dietéticos y sus platos sustitutos
        var @event = await _context.Events
            .Include(e => e.MenuDishes)
                .ThenInclude(d => d.Ingredients)
                    .ThenInclude(di => di.Ingredient)
            .Include(e => e.DietaryRequirements)
                .ThenInclude(dr => dr.ReplacedDish)
            .Include(e => e.DietaryRequirements)
                .ThenInclude(dr => dr.SubstituteDish)
                    .ThenInclude(sd => sd!.Ingredients)
                        .ThenInclude(sdi => sdi.Ingredient)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == request.EventId, cancellationToken);

        if (@event == null)
        {
            return null;
        }

        var dietaryGuests = @event.DietaryRequirements.Sum(dr => dr.GuestCount);
        var standardGuests = Math.Max(0, @event.StandardGuests - dietaryGuests);

        var shoppingList = new EventShoppingListDto
        {
            EventId = @event.Id,
            EventName = @event.Name,
            EventDate = @event.EventDate,
            Guests = @event.StandardGuests,
            StandardGuests = standardGuests,
            DietaryGuests = dietaryGuests,
            TotalDishes = @event.MenuDishes.Count,
            DietaryRequirements = @event.DietaryRequirements.Select(dr => new EventDietaryRequirementDto
            {
                Id = dr.Id,
                RequirementName = dr.RequirementName,
                GuestCount = dr.GuestCount,
                ReplacedDishId = dr.ReplacedDishId,
                ReplacedDishName = dr.ReplacedDish?.Name,
                SubstituteDishId = dr.SubstituteDishId,
                SubstituteDishName = dr.SubstituteDish?.Name,
                Notes = dr.Notes
            }).ToList()
        };

        // 2. Reunimos todos los platos involucrados (menú estándar + platos sustitutos especiales)
        var allDishesMap = new Dictionary<Guid, (Domain.Entities.Dish Dish, bool IsMenuDish)>();
        foreach (var dish in @event.MenuDishes)
        {
            allDishesMap[dish.Id] = (dish, true);
        }

        foreach (var dr in @event.DietaryRequirements)
        {
            if (dr.SubstituteDish != null && !allDishesMap.ContainsKey(dr.SubstituteDish.Id))
            {
                allDishesMap[dr.SubstituteDish.Id] = (dr.SubstituteDish, false);
            }
        }

        // 3. Calculamos la Ficha de Pase de Partida (DishPortionBreakdown) para cada plato
        var dishPortionsToCook = new Dictionary<Guid, int>();

        foreach (var kvp in allDishesMap)
        {
            var dish = kvp.Value.Dish;
            var isMenuDish = kvp.Value.IsMenuDish;

            int stdPortions = isMenuDish ? @event.StandardGuests : 0;
            int replacedPortions = isMenuDish
                ? @event.DietaryRequirements.Where(dr => dr.ReplacedDishId == dish.Id).Sum(dr => dr.GuestCount)
                : 0;

            int specialPortions = @event.DietaryRequirements
                .Where(dr => dr.SubstituteDishId == dish.Id)
                .Sum(dr => dr.GuestCount);

            int totalPortions = Math.Max(0, stdPortions - replacedPortions) + specialPortions;
            dishPortionsToCook[dish.Id] = totalPortions;

            var notes = new List<string>();
            foreach (var dr in @event.DietaryRequirements.Where(dr => dr.ReplacedDishId == dish.Id))
            {
                notes.Add($"Reemplazado por {dr.GuestCount} pax ({dr.RequirementName})");
            }
            foreach (var dr in @event.DietaryRequirements.Where(dr => dr.SubstituteDishId == dish.Id))
            {
                var extra = string.IsNullOrWhiteSpace(dr.Notes) ? "" : $" ({dr.Notes})";
                notes.Add($"Menú especial para {dr.GuestCount} pax ({dr.RequirementName}){extra}");
            }

            shoppingList.DishBreakdown.Add(new DishPortionBreakdownDto
            {
                DishId = dish.Id,
                DishName = dish.Name,
                Category = dish.Category,
                IsMenuDish = isMenuDish,
                StandardPortions = stdPortions,
                SubstitutedOutPortions = replacedPortions,
                SpecialPortions = specialPortions,
                TotalPortionsToCook = totalPortions,
                SpecialRequirementNotes = notes
            });
        }

        // Ordenamos el desglose de platos: primero platos de menú, luego sustitutos especiales
        shoppingList.DishBreakdown = shoppingList.DishBreakdown
            .OrderByDescending(d => d.IsMenuDish)
            .ThenBy(d => d.Category)
            .ThenBy(d => d.DishName)
            .ToList();

        // 4. Consolidamos ingredientes considerando las porciones reales a cocinar
        var ingredientAggregates = new Dictionary<Guid, (
            Domain.Entities.Ingredient Ingredient,
            decimal TotalNetQuantity,
            int TotalPortionsCount,
            HashSet<string> Dishes
        )>();

        foreach (var kvp in allDishesMap)
        {
            var dish = kvp.Value.Dish;
            int portions = dishPortionsToCook[dish.Id];
            if (portions <= 0) continue;

            foreach (var dishIngredient in dish.Ingredients)
            {
                var ingredient = dishIngredient.Ingredient;
                if (ingredient == null) continue;

                var dishNetQuantity = dishIngredient.Quantity * portions;
                var dishLabel = $"{dish.Name} ({portions} rac.)";

                if (ingredientAggregates.TryGetValue(ingredient.Id, out var existing))
                {
                    existing.TotalNetQuantity += dishNetQuantity;
                    existing.TotalPortionsCount += portions;
                    existing.Dishes.Add(dishLabel);
                    ingredientAggregates[ingredient.Id] = existing;
                }
                else
                {
                    var dishesSet = new HashSet<string> { dishLabel };
                    ingredientAggregates[ingredient.Id] = (ingredient, dishNetQuantity, portions, dishesSet);
                }
            }
        }

        decimal totalReusableTrimmings = 0;
        int totalAlerts = 0;

        // 5. Calculamos mermas, stock disponible y rendimiento por piezas enteras
        foreach (var kvp in ingredientAggregates)
        {
            var ingredient = kvp.Value.Ingredient;
            var netQuantity = kvp.Value.TotalNetQuantity;
            var totalPortionsRequired = kvp.Value.TotalPortionsCount;

            // Normalizamos los porcentajes (acepta tanto 0.15 como 15)
            var rawNetWaste = ingredient.WastePercentage;
            var normalizedNetWaste = rawNetWaste > 1m && rawNetWaste <= 100m ? rawNetWaste / 100m : rawNetWaste;

            var rawReusableWaste = ingredient.ReusableWastePercentage;
            var normalizedReusableWaste = rawReusableWaste > 1m && rawReusableWaste <= 100m ? rawReusableWaste / 100m : rawReusableWaste;

            var totalWaste = Math.Min(0.99m, normalizedNetWaste + normalizedReusableWaste);

            // Fórmula de escandallo profesional:
            // Bruto = Neto / (1 - MermaTotal)
            decimal grossQuantityRequired = netQuantity;
            if (totalWaste > 0 && totalWaste < 1.0m)
            {
                grossQuantityRequired = netQuantity / (1.0m - totalWaste);
            }

            // Subproductos y desperdicio estimado
            decimal estimatedReusable = grossQuantityRequired * normalizedReusableWaste;
            decimal estimatedTrash = grossQuantityRequired * normalizedNetWaste;
            totalReusableTrimmings += estimatedReusable;

            // Análisis de inventario
            decimal currentStock = ingredient.CurrentStock;
            decimal minStock = ingredient.MinimumStock;
            decimal quantityToBuy = Math.Max(0m, grossQuantityRequired - currentStock);
            decimal projectedStockAfter = currentStock - grossQuantityRequired;

            bool isAlert = false;
            string? alertMsg = null;

            if (currentStock < minStock)
            {
                isAlert = true;
                alertMsg = $"Stock actual ({currentStock:0.##} {ingredient.UnitOfMeasure}) inferior al mínimo ({minStock:0.##} {ingredient.UnitOfMeasure}).";
                totalAlerts++;
            }
            else if (projectedStockAfter < minStock)
            {
                isAlert = true;
                alertMsg = $"Tras el evento, el stock remanente ({projectedStockAfter:0.##} {ingredient.UnitOfMeasure}) quedará por debajo del mínimo de seguridad ({minStock:0.##} {ingredient.UnitOfMeasure}).";
                totalAlerts++;
            }

            // Cálculo por piezas enteras (Regla del Chef: cálculo conservador sobre raciones mínimas)
            int? piecesToBuy = null;
            int? estMinYield = null;
            int? estMaxYield = null;
            int? estSurplus = null;

            if (ingredient.IsPurchasedByPiece && ingredient.MinPortionsPerPiece.HasValue && ingredient.MinPortionsPerPiece.Value > 0)
            {
                int minYield = ingredient.MinPortionsPerPiece.Value;
                int maxYield = ingredient.MaxPortionsPerPiece ?? minYield;

                // Piezas enteras necesarias según el rendimiento mínimo garantizado
                int totalPiecesNeeded = (int)Math.Ceiling((double)totalPortionsRequired / minYield);

                // Si la unidad es unidades/piezas, descontamos las piezas ya en stock
                int piecesInStock = (int)Math.Floor(currentStock);
                piecesToBuy = Math.Max(0, totalPiecesNeeded - piecesInStock);

                estMinYield = totalPiecesNeeded * minYield;
                estMaxYield = totalPiecesNeeded * maxYield;
                estSurplus = Math.Max(0, estMaxYield.Value - totalPortionsRequired);
            }

            shoppingList.Items.Add(new ShoppingListItemDto
            {
                IngredientId = ingredient.Id,
                IngredientName = ingredient.Name,
                UnitOfMeasure = ingredient.UnitOfMeasure,
                TotalNetQuantity = Math.Round(netQuantity, 3),
                WastePercentage = Math.Round(normalizedNetWaste, 4),
                ReusableWastePercentage = Math.Round(normalizedReusableWaste, 4),
                TotalWastePercentage = Math.Round(totalWaste, 4),
                TotalGrossQuantityRequired = Math.Round(grossQuantityRequired, 3),
                CurrentStock = Math.Round(currentStock, 3),
                MinimumStock = Math.Round(minStock, 3),
                QuantityToBuy = Math.Round(quantityToBuy, 3),
                ProjectedStockAfterEvent = Math.Round(projectedStockAfter, 3),
                IsLowStockAlert = isAlert,
                LowStockMessage = alertMsg,
                EstimatedReusableQuantity = Math.Round(estimatedReusable, 3),
                EstimatedNetTrashQuantity = Math.Round(estimatedTrash, 3),
                IsPurchasedByPiece = ingredient.IsPurchasedByPiece,
                MinPortionsPerPiece = ingredient.MinPortionsPerPiece,
                MaxPortionsPerPiece = ingredient.MaxPortionsPerPiece,
                TotalPortionsRequired = totalPortionsRequired,
                PiecesToBuy = piecesToBuy,
                EstimatedMinPortionsYield = estMinYield,
                EstimatedMaxPortionsYield = estMaxYield,
                EstimatedSurplusPortions = estSurplus,
                DefaultProvider = ingredient.DefaultProvider,
                Allergens = ingredient.Allergens ?? new List<string>(),
                IsVegetarian = ingredient.IsVegetarian,
                IsVegan = ingredient.IsVegan,
                UsedInDishes = kvp.Value.Dishes.OrderBy(d => d).ToList()
            });
        }

        shoppingList.TotalEstimatedReusableTrimmings = Math.Round(totalReusableTrimmings, 3);
        shoppingList.TotalStockAlerts = totalAlerts;

        // Ordenamos alfabéticamente por nombre de ingrediente
        shoppingList.Items = shoppingList.Items.OrderBy(i => i.IngredientName).ToList();

        return shoppingList;
    }
}
