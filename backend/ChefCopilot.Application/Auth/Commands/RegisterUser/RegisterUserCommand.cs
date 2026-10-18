using ChefCopilot.Application.Auth.Common;
using ChefCopilot.Application.Common.Interfaces;
using ChefCopilot.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Auth.Commands.RegisterUser;

public class RegisterUserCommand : IRequest<AuthResponseDto>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
}

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterUserCommandHandler(IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResponseDto> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        // 1. Verificamos que no exista otro usuario con el mismo email
        var exists = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);

        if (exists)
        {
            throw new Exception("Ya existe una cuenta registrada con este correo electrónico.");
        }

        // 2. Hasheamos la contraseña de forma criptográfica (PBKDF2 SHA-256)
        var passwordHash = _passwordHasher.HashPassword(request.Password);

        // 3. Creamos la entidad User
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            PasswordHash = passwordHash,
            FullName = request.FullName.Trim(),
            RestaurantName = string.IsNullOrWhiteSpace(request.RestaurantName) ? "Cocina Principal" : request.RestaurantName.Trim(),
            Role = "Chef",
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            RestaurantName = user.RestaurantName,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
            Message = "Usuario registrado correctamente en ChefCopilot."
        };
    }
}
