namespace ChefCopilot.Application.Events.Common;

public class CloseEventPostMortemItemDto
{
    public Guid IngredientId { get; set; }
    public decimal ActualWasteQuantity { get; set; }
    public decimal ActualReusableQuantity { get; set; }
    public bool ApplyToPantry { get; set; }
    public string? Notes { get; set; }
}

public class EventPostMortemItemDto
{
    public Guid Id { get; set; }
    public Guid IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public string UnitOfMeasure { get; set; } = string.Empty;

    public decimal PlannedGrossQuantity { get; set; }
    public decimal PlannedWastePercentage { get; set; }
    public decimal PlannedWasteQuantity { get; set; }
    public decimal PlannedReusablePercentage { get; set; }
    public decimal PlannedReusableQuantity { get; set; }

    public decimal ActualWasteQuantity { get; set; }
    public decimal ActualReusableQuantity { get; set; }
    public decimal ActualWastePercentage { get; set; }
    public decimal ActualReusablePercentage { get; set; }
    public decimal WasteDeviationPercentage { get; set; }
    public bool AppliedToPantry { get; set; }
    public string? Notes { get; set; }
}

public class EventPostMortemReportDto
{
    public Guid EventId { get; set; }
    public string EventName { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string Status { get; set; } = "Planned";
    public DateTime? CompletedAt { get; set; }
    public string? PostMortemNotes { get; set; }

    public decimal TotalPlannedWasteQuantity { get; set; }
    public decimal TotalActualWasteQuantity { get; set; }
    public decimal TotalPlannedReusableQuantity { get; set; }
    public decimal TotalActualReusableQuantity { get; set; }
    public decimal OverallEfficiencyPercentage { get; set; }

    public List<EventPostMortemItemDto> Items { get; set; } = new();
}
