namespace ChefCopilot.Domain.Entities;

public class Ingredient
{
    public Guid Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string UnitOfMeasure { get; set; } = string.Empty;
    
    public decimal WastePercentage { get; set; } 
    
    public string DefaultProvider { get; set; } = string.Empty;

    public List<string> Allergens { get; set; } = new();
    
    public bool IsVegetarian { get; set; }
    public bool IsVegan { get; set; }
}
