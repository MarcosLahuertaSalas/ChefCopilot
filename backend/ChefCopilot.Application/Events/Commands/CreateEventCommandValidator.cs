using FluentValidation;

namespace ChefCopilot.Application.Events.Commands;

public class CreateEventCommandValidator : AbstractValidator<CreateEventCommand>
{
    public CreateEventCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("El nombre del evento es obligatorio (ej: Boda de Carlos y Ana).")
            .MaximumLength(150).WithMessage("El nombre del evento no puede superar los 150 caracteres.");

        RuleFor(v => v.StandardGuests)
            .GreaterThan(0).WithMessage("El número de comensales debe ser mayor que cero.");

        RuleFor(v => v.DishIds)
            .NotEmpty().WithMessage("El evento debe incluir al menos un plato en su menú.");

        RuleForEach(v => v.DietaryRequirements).ChildRules(req =>
        {
            req.RuleFor(r => r.RequirementName)
                .NotEmpty().WithMessage("El nombre de la condición dietética es obligatorio (ej: Celíaco, Vegano).")
                .MaximumLength(100).WithMessage("El nombre de la condición no puede superar los 100 caracteres.");

            req.RuleFor(r => r.GuestCount)
                .GreaterThan(0).WithMessage("El número de comensales para una condición dietética debe ser mayor que cero.");
        });

        RuleFor(v => v)
            .Must(v => v.DietaryRequirements.Sum(r => r.GuestCount) <= v.StandardGuests)
            .WithMessage("El total de comensales con excepciones dietéticas no puede superar el total de comensales del evento.")
            .When(v => v.DietaryRequirements.Any() && v.StandardGuests > 0);
    }
}
