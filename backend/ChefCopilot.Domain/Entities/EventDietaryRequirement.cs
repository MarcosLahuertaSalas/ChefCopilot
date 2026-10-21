namespace ChefCopilot.Domain.Entities;

public class EventDietaryRequirement
{
    public Guid Id { get; set; }

    public Guid EventId { get; set; }
    public Event Event { get; set; } = null!;

    // Nombre de la condición (ej: "Celíacos / Sin Gluten", "Vegano", "Alérgico a mariscos", "Sin lactosa")
    public string RequirementName { get; set; } = string.Empty;

    // Número de comensales afectados con esta condición
    public int GuestCount { get; set; }

    // Plato del menú estándar que NO comen (opcional: ej. Solomillo al Foie)
    public Guid? ReplacedDishId { get; set; }
    public Dish? ReplacedDish { get; set; }

    // Plato alternativo o sustituto asignado (opcional: ej. Risotto de Setas Silvestres)
    public Guid? SubstituteDishId { get; set; }
    public Dish? SubstituteDish { get; set; }

    // Notas de cocina o de sala (ej: "Mesa 4 y 7, emplatar con campana especial")
    public string? Notes { get; set; }
}
