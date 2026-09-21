namespace ChefCopilot.Domain.Entities;

public class Dish
{
    public Guid Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    // Entrante, Principal, Postre, etc.
    public string Category { get; set; } = string.Empty;

    // Aquí está la magia: La receta exacta del plato
    public List<DishIngredient> Ingredients { get; set; } = new();
}
