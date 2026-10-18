namespace ChefCopilot.Application.Auth.Common;

public class AuthResponseDto
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    public string Role { get; set; } = "Chef";
    public DateTime CreatedAt { get; set; }
    public string Message { get; set; } = string.Empty;
}
