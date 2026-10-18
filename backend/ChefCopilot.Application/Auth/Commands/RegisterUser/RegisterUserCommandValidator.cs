using FluentValidation;

namespace ChefCopilot.Application.Auth.Commands.RegisterUser;

public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator()
    {
        RuleFor(v => v.Email)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress().WithMessage("El formato del correo electrónico no es válido.")
            .MaximumLength(150).WithMessage("El correo no puede exceder los 150 caracteres.");

        RuleFor(v => v.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria.")
            .MinimumLength(6).WithMessage("La contraseña debe tener al menos 6 caracteres.")
            .MaximumLength(100).WithMessage("La contraseña no puede exceder los 100 caracteres.");

        RuleFor(v => v.FullName)
            .NotEmpty().WithMessage("El nombre y apellidos del chef/responsable son obligatorios.")
            .MaximumLength(100).WithMessage("El nombre no puede exceder los 100 caracteres.");

        RuleFor(v => v.RestaurantName)
            .MaximumLength(100).WithMessage("El nombre del restaurante no puede exceder los 100 caracteres.");
    }
}
