using FluentValidation;

namespace ChefCopilot.Application.Auth.Commands.LoginUser;

public class LoginUserCommandValidator : AbstractValidator<LoginUserCommand>
{
    public LoginUserCommandValidator()
    {
        RuleFor(v => v.Email)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio para iniciar sesión.")
            .EmailAddress().WithMessage("El formato del correo electrónico no es válido.");

        RuleFor(v => v.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria.");
    }
}
