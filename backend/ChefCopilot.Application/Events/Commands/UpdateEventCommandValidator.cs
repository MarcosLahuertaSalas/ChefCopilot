using FluentValidation;

namespace ChefCopilot.Application.Events.Commands;

public class UpdateEventCommandValidator : AbstractValidator<UpdateEventCommand>
{
    public UpdateEventCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("El ID del evento es obligatorio.");

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("El nombre del evento es obligatorio.")
            .MaximumLength(150).WithMessage("El nombre del evento no puede superar los 150 caracteres.");

        RuleFor(v => v.StandardGuests)
            .GreaterThan(0).WithMessage("El número de comensales debe ser mayor que cero.");

        RuleFor(v => v.DishIds)
            .NotEmpty().WithMessage("El evento debe incluir al menos un plato en su menú.");
    }
}
