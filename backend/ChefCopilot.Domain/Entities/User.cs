namespace ChefCopilot.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    public string Role { get; set; } = "Chef";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
