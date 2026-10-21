namespace ChefCopilot.Application.Events.Common;

public class EventDishDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class EventDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public int StandardGuests { get; set; }
    public List<EventDishDto> MenuDishes { get; set; } = new();
    public List<EventDietaryRequirementDto> DietaryRequirements { get; set; } = new();
}
