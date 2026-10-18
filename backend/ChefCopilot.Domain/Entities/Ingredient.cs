namespace ChefCopilot.Domain.Entities;

public class Ingredient
{
    public Guid Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    // Unidad de medida base (Kg, Litros, Unidades, etc.)
    public string UnitOfMeasure { get; set; } = string.Empty;
    
    // Desperdicio neto técnico (lo que NO se puede reutilizar y va a la basura)
    // Ejemplo: 0.10 para un 10%
    public decimal WastePercentage { get; set; } 

    // Merma aprovechable / subproducto (recortes de solomillo para albóndigas, huesos para caldos)
    // Ejemplo: 0.15 para un 15%
    public decimal ReusableWastePercentage { get; set; }

    // Inventario: Stock actual físico en cámara/almacén
    public decimal CurrentStock { get; set; }

    // Inventario: Stock mínimo de seguridad (si baja de aquí, se dispara aviso)
    public decimal MinimumStock { get; set; }
    
    // Indica si el ingrediente se adquiere por piezas enteras (ej: solomillos enteros, rodaballos)
    public bool IsPurchasedByPiece { get; set; }

    // Rendimiento mínimo garantizado de raciones por pieza (el cálculo pesimista del chef, ej: 8)
    public int? MinPortionsPerPiece { get; set; }

    // Rendimiento máximo ideal de raciones por pieza (ej: 10)
    public int? MaxPortionsPerPiece { get; set; }

    public string DefaultProvider { get; set; } = string.Empty;

    public List<string> Allergens { get; set; } = new();
    
    public bool IsVegetarian { get; set; }
    public bool IsVegan { get; set; }
}
