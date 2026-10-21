namespace ChefCopilot.Domain.Entities;

public class Event
{
    public Guid Id { get; set; }
    
    // Ej: "Boda de Juan y María"
    public string Name { get; set; } = string.Empty;
    
    // Fecha y hora del banquete
    public DateTime EventDate { get; set; }
    
    // Número base de comensales (el groso que come el menú estándar)
    public int StandardGuests { get; set; }
    
    // Platos que conforman el menú de este evento
    // (En base de datos esto generará una tabla intermedia EventDish automáticamente)
    public List<Dish> MenuDishes { get; set; } = new();
    
    // Excepciones dietéticas y menús especiales (celíacos, veganos, etc.)
    public List<EventDietaryRequirement> DietaryRequirements { get; set; } = new();
}
