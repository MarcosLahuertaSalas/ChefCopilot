namespace ChefCopilot.Application.Events.Common;

public class EventDietaryRequirementDto
{
    public Guid Id { get; set; }
    public string RequirementName { get; set; } = string.Empty;
    public int GuestCount { get; set; }
    public Guid? ReplacedDishId { get; set; }
    public string? ReplacedDishName { get; set; }
    public Guid? SubstituteDishId { get; set; }
    public string? SubstituteDishName { get; set; }
    public string? Notes { get; set; }
}

public class CreateEventDietaryRequirementDto
{
    public string RequirementName { get; set; } = string.Empty;
    public int GuestCount { get; set; }
    public Guid? ReplacedDishId { get; set; }
    public Guid? SubstituteDishId { get; set; }
    public string? Notes { get; set; }
}
