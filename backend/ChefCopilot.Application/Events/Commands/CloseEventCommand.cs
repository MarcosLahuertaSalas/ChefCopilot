using ChefCopilot.Application.Common.Interfaces;
using ChefCopilot.Application.Events.Common;
using ChefCopilot.Domain.Entities;
using ChefCopilot.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Events.Commands;

public class CloseEventCommand : IRequest
{
    public Guid EventId { get; set; }
    public string? PostMortemNotes { get; set; }
    public List<CloseEventPostMortemItemDto> Items { get; set; } = new();
}

public class CloseEventCommandHandler : IRequestHandler<CloseEventCommand>
{
    private readonly IApplicationDbContext _context;

    public CloseEventCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(CloseEventCommand request, CancellationToken cancellationToken)
    {
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
            .Include(e => e.PostMortemItems)
            .FirstOrDefaultAsync(e => e.Id == request.EventId, cancellationToken);

        if (@event == null)
        {
            throw new Exception($"El banquete con ID {request.EventId} no existe.");
        }

        // 1. Calculamos las raciones y consumos teóricos de cada plato
        var allDishesMap = new Dictionary<Guid, (Dish Dish, bool IsMenuDish)>();
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
        }

        // 2. Calculamos los brutos y mermas teóricas por ingrediente
        var theoreticalUsage = new Dictionary<Guid, (
            Ingredient Ingredient,
            decimal NetQuantity,
            decimal GrossQuantity,
            decimal NormalizedWaste,
            decimal NormalizedReusable
        )>();

        foreach (var kvp in allDishesMap)
        {
            var dish = kvp.Value.Dish;
            int portions = dishPortionsToCook[dish.Id];
            if (portions <= 0) continue;

            foreach (var di in dish.Ingredients)
            {
                var ingredient = di.Ingredient;
                if (ingredient == null) continue;

                var net = di.Quantity * portions;
                if (theoreticalUsage.TryGetValue(ingredient.Id, out var existing))
                {
                    existing.NetQuantity += net;
                    theoreticalUsage[ingredient.Id] = existing;
                }
                else
                {
                    var rawWaste = ingredient.WastePercentage;
                    var normWaste = rawWaste > 1m && rawWaste <= 100m ? rawWaste / 100m : rawWaste;

                    var rawReusable = ingredient.ReusableWastePercentage;
                    var normReusable = rawReusable > 1m && rawReusable <= 100m ? rawReusable / 100m : rawReusable;

                    theoreticalUsage[ingredient.Id] = (ingredient, net, 0, normWaste, normReusable);
                }
            }
        }

        // Calculamos el bruto teórico con la fórmula gastronómica
        var finalizedTheoretical = new Dictionary<Guid, (
            Ingredient Ingredient,
            decimal GrossQuantity,
            decimal WastePct,
            decimal WasteQty,
            decimal ReusablePct,
            decimal ReusableQty
        )>();

        foreach (var kvp in theoreticalUsage)
        {
            var ing = kvp.Value.Ingredient;
            var net = kvp.Value.NetQuantity;
            var totalWaste = Math.Min(0.99m, kvp.Value.NormalizedWaste + kvp.Value.NormalizedReusable);

            decimal gross = net;
            if (totalWaste > 0 && totalWaste < 1.0m)
            {
                gross = net / (1.0m - totalWaste);
            }

            decimal wasteQty = gross * kvp.Value.NormalizedWaste;
            decimal reusableQty = gross * kvp.Value.NormalizedReusable;

            finalizedTheoretical[ing.Id] = (
                ing,
                Math.Round(gross, 4),
                Math.Round(kvp.Value.NormalizedWaste, 4),
                Math.Round(wasteQty, 4),
                Math.Round(kvp.Value.NormalizedReusable, 4),
                Math.Round(reusableQty, 4)
            );
        }

        // 3. Reemplazamos los ítems de auditoría existentes de forma segura
        _context.EventPostMortemItems.RemoveRange(@event.PostMortemItems);

        foreach (var inputItem in request.Items)
        {
            if (!finalizedTheoretical.TryGetValue(inputItem.IngredientId, out var theo))
            {
                // Si el ingrediente no estaba en las recetas pero el chef lo registró
                var ing = await _context.Ingredients.FirstOrDefaultAsync(i => i.Id == inputItem.IngredientId, cancellationToken);
                if (ing == null) continue;
                theo = (ing, inputItem.ActualWasteQuantity + inputItem.ActualReusableQuantity, 0, 0, 0, 0);
            }

            var gross = theo.GrossQuantity;
            decimal actualWastePct = gross > 0 ? inputItem.ActualWasteQuantity / gross : 0;
            decimal actualReusablePct = gross > 0 ? inputItem.ActualReusableQuantity / gross : 0;
            decimal deviation = actualWastePct - theo.WastePct;

            var postMortemItem = new EventPostMortemItem
            {
                Id = Guid.NewGuid(),
                EventId = @event.Id,
                IngredientId = inputItem.IngredientId,
                PlannedGrossQuantity = theo.GrossQuantity,
                PlannedWastePercentage = theo.WastePct,
                PlannedWasteQuantity = theo.WasteQty,
                PlannedReusablePercentage = theo.ReusablePct,
                PlannedReusableQuantity = theo.ReusableQty,
                ActualWasteQuantity = Math.Round(inputItem.ActualWasteQuantity, 4),
                ActualReusableQuantity = Math.Round(inputItem.ActualReusableQuantity, 4),
                ActualWastePercentage = Math.Round(actualWastePct, 4),
                ActualReusablePercentage = Math.Round(actualReusablePct, 4),
                WasteDeviationPercentage = Math.Round(deviation, 4),
                AppliedToPantry = inputItem.ApplyToPantry,
                Notes = inputItem.Notes?.Trim()
            };

            _context.EventPostMortemItems.Add(postMortemItem);

            // 4. Si el chef activó la actualización de la despensa, ajustamos los coeficientes empíricos
            if (inputItem.ApplyToPantry)
            {
                var ingredientToUpdate = await _context.Ingredients.FirstOrDefaultAsync(i => i.Id == inputItem.IngredientId, cancellationToken);
                if (ingredientToUpdate != null)
                {
                    // Convertimos a base 100 si la convención del ingrediente es porcentual
                    decimal newWastePercentage = actualWastePct <= 1.0m ? actualWastePct * 100m : actualWastePct;
                    decimal newReusablePercentage = actualReusablePct <= 1.0m ? actualReusablePct * 100m : actualReusablePct;

                    ingredientToUpdate.WastePercentage = Math.Round(newWastePercentage, 2);
                    ingredientToUpdate.ReusableWastePercentage = Math.Round(newReusablePercentage, 2);
                }
            }
        }

        // 5. Marcamos el evento como Completado / Auditado
        @event.Status = EventStatus.Completed;
        @event.CompletedAt = DateTime.UtcNow;
        @event.PostMortemNotes = request.PostMortemNotes?.Trim();

        await _context.SaveChangesAsync(cancellationToken);
    }
}
