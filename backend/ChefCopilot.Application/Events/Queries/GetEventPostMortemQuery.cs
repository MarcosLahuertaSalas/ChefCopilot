using ChefCopilot.Application.Common.Interfaces;
using ChefCopilot.Application.Events.Common;
using ChefCopilot.Domain.Entities;
using ChefCopilot.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Events.Queries;

public class GetEventPostMortemQuery : IRequest<EventPostMortemReportDto?>
{
    public Guid EventId { get; set; }
}

public class GetEventPostMortemQueryHandler : IRequestHandler<GetEventPostMortemQuery, EventPostMortemReportDto?>
{
    private readonly IApplicationDbContext _context;

    public GetEventPostMortemQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EventPostMortemReportDto?> Handle(GetEventPostMortemQuery request, CancellationToken cancellationToken)
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
                .ThenInclude(pmi => pmi.Ingredient)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == request.EventId, cancellationToken);

        if (@event == null)
        {
            return null;
        }

        var report = new EventPostMortemReportDto
        {
            EventId = @event.Id,
            EventName = @event.Name,
            EventDate = @event.EventDate,
            Status = @event.Status.ToString(),
            CompletedAt = @event.CompletedAt,
            PostMortemNotes = @event.PostMortemNotes
        };

        // 1. Si el banquete ya está cerrado y tiene ítems grabados en base de datos
        if (@event.Status == EventStatus.Completed && @event.PostMortemItems.Any())
        {
            foreach (var item in @event.PostMortemItems)
            {
                report.Items.Add(new EventPostMortemItemDto
                {
                    Id = item.Id,
                    IngredientId = item.IngredientId,
                    IngredientName = item.Ingredient.Name,
                    UnitOfMeasure = item.Ingredient.UnitOfMeasure,
                    PlannedGrossQuantity = item.PlannedGrossQuantity,
                    PlannedWastePercentage = item.PlannedWastePercentage,
                    PlannedWasteQuantity = item.PlannedWasteQuantity,
                    PlannedReusablePercentage = item.PlannedReusablePercentage,
                    PlannedReusableQuantity = item.PlannedReusableQuantity,
                    ActualWasteQuantity = item.ActualWasteQuantity,
                    ActualReusableQuantity = item.ActualReusableQuantity,
                    ActualWastePercentage = item.ActualWastePercentage,
                    ActualReusablePercentage = item.ActualReusablePercentage,
                    WasteDeviationPercentage = item.WasteDeviationPercentage,
                    AppliedToPantry = item.AppliedToPantry,
                    Notes = item.Notes
                });
            }

            report.TotalPlannedWasteQuantity = report.Items.Sum(i => i.PlannedWasteQuantity);
            report.TotalActualWasteQuantity = report.Items.Sum(i => i.ActualWasteQuantity);
            report.TotalPlannedReusableQuantity = report.Items.Sum(i => i.PlannedReusableQuantity);
            report.TotalActualReusableQuantity = report.Items.Sum(i => i.ActualReusableQuantity);

            // Eficiencia del escandallo: 100 - promedio de desviación absoluta
            decimal avgDeviation = report.Items.Any() ? report.Items.Average(i => Math.Abs(i.WasteDeviationPercentage)) : 0;
            report.OverallEfficiencyPercentage = Math.Max(0, Math.Round((1.0m - avgDeviation) * 100m, 1));

            return report;
        }

        // 2. Si todavía no está cerrado o es una previsualización de auditoría, calculamos la base teórica
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

        var ingredientAggregates = new Dictionary<Guid, (Ingredient Ingredient, decimal NetQuantity)>();
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
                if (ingredientAggregates.TryGetValue(ingredient.Id, out var existing))
                {
                    existing.NetQuantity += net;
                    ingredientAggregates[ingredient.Id] = existing;
                }
                else
                {
                    ingredientAggregates[ingredient.Id] = (ingredient, net);
                }
            }
        }

        foreach (var kvp in ingredientAggregates)
        {
            var ing = kvp.Value.Ingredient;
            var net = kvp.Value.NetQuantity;

            var rawWaste = ing.WastePercentage;
            var normWaste = rawWaste > 1m && rawWaste <= 100m ? rawWaste / 100m : rawWaste;

            var rawReusable = ing.ReusableWastePercentage;
            var normReusable = rawReusable > 1m && rawReusable <= 100m ? rawReusable / 100m : rawReusable;

            var totalWaste = Math.Min(0.99m, normWaste + normReusable);
            decimal gross = net;
            if (totalWaste > 0 && totalWaste < 1.0m)
            {
                gross = net / (1.0m - totalWaste);
            }

            decimal plannedWasteQty = gross * normWaste;
            decimal plannedReusableQty = gross * normReusable;

            report.Items.Add(new EventPostMortemItemDto
            {
                Id = Guid.Empty,
                IngredientId = ing.Id,
                IngredientName = ing.Name,
                UnitOfMeasure = ing.UnitOfMeasure,
                PlannedGrossQuantity = Math.Round(gross, 3),
                PlannedWastePercentage = Math.Round(normWaste, 4),
                PlannedWasteQuantity = Math.Round(plannedWasteQty, 3),
                PlannedReusablePercentage = Math.Round(normReusable, 4),
                PlannedReusableQuantity = Math.Round(plannedReusableQty, 3),
                // Valores iniciales sugeridos para que el chef solo modifique
                ActualWasteQuantity = Math.Round(plannedWasteQty, 3),
                ActualReusableQuantity = Math.Round(plannedReusableQty, 3),
                ActualWastePercentage = Math.Round(normWaste, 4),
                ActualReusablePercentage = Math.Round(normReusable, 4),
                WasteDeviationPercentage = 0,
                AppliedToPantry = false
            });
        }

        report.TotalPlannedWasteQuantity = Math.Round(report.Items.Sum(i => i.PlannedWasteQuantity), 3);
        report.TotalActualWasteQuantity = report.TotalPlannedWasteQuantity;
        report.TotalPlannedReusableQuantity = Math.Round(report.Items.Sum(i => i.PlannedReusableQuantity), 3);
        report.TotalActualReusableQuantity = report.TotalPlannedReusableQuantity;
        report.OverallEfficiencyPercentage = 100m;

        report.Items = report.Items.OrderBy(i => i.IngredientName).ToList();

        return report;
    }
}
