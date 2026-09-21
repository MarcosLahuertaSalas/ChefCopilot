namespace ChefCopilot.Domain.Entities;

public class DishIngredient
{
    public Guid Id { get; set; }
    
    // El plato al que pertenece esta línea de receta
    public Guid DishId { get; set; }
    
    // El ingrediente específico (ej: El Solomillo)
    public Guid IngredientId { get; set; }
    public Ingredient Ingredient { get; set; } = null!; // Referencia para navegar
    
    // La cantidad bruta que necesita la receta (ej: 0.25 para 250 gramos si la unidad del ingrediente es Kg)
    public decimal Quantity { get; set; }
}
