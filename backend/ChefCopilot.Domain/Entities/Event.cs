using ChefCopilot.Domain.Enums;

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
    
    // Estado del banquete: Planned (Planificado) o Completed (Finalizado/Auditado)
    public EventStatus Status { get; set; } = EventStatus.Planned;

    // Fecha y hora en la que se cerró el servicio
    public DateTime? CompletedAt { get; set; }

    // Resumen u observaciones generales del servicio
    public string? PostMortemNotes { get; set; }

    // Platos que conforman el menú de este evento
    public List<Dish> MenuDishes { get; set; } = new();
    
    // Excepciones dietéticas y menús especiales (celíacos, veganos, etc.)
    public List<EventDietaryRequirement> DietaryRequirements { get; set; } = new();

    // Auditoría post-servicio de mermas reales y subproductos rescatados
    public List<EventPostMortemItem> PostMortemItems { get; set; } = new();
}
