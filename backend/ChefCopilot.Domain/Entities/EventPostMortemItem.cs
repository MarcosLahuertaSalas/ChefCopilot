namespace ChefCopilot.Domain.Entities;

public class EventPostMortemItem
{
    public Guid Id { get; set; }

    public Guid EventId { get; set; }
    public Event Event { get; set; } = null!;

    public Guid IngredientId { get; set; }
    public Ingredient Ingredient { get; set; } = null!;

    // Consumo bruto previsto en la preparación (ej: Kg)
    public decimal PlannedGrossQuantity { get; set; }

    // Valores teóricos calculados previamente
    public decimal PlannedWastePercentage { get; set; }
    public decimal PlannedWasteQuantity { get; set; }

    public decimal PlannedReusablePercentage { get; set; }
    public decimal PlannedReusableQuantity { get; set; }

    // Cantidades reales pesadas en cocina tras el servicio
    public decimal ActualWasteQuantity { get; set; }
    public decimal ActualReusableQuantity { get; set; }

    // Porcentajes reales derivados
    public decimal ActualWastePercentage { get; set; }
    public decimal ActualReusablePercentage { get; set; }

    // Desviación porcentual respecto a la previsión teórica
    public decimal WasteDeviationPercentage { get; set; }

    // Si el chef decidió actualizar el coeficiente del ingrediente en la despensa
    public bool AppliedToPantry { get; set; }

    // Observaciones técnicas de la partida o proveedor
    public string? Notes { get; set; }
}
