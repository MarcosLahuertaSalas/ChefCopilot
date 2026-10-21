using FluentValidation;

namespace ChefCopilot.Application.Events.Commands;

public class CloseEventCommandValidator : AbstractValidator<CloseEventCommand>
{
    public CloseEventCommandValidator()
    {
        RuleFor(v => v.EventId)
            .NotEmpty().WithMessage("El ID del evento es obligatorio para registrar el cierre.");

        RuleForEach(v => v.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.IngredientId)
                .NotEmpty().WithMessage("El ID del ingrediente es obligatorio.");

            item.RuleFor(i => i.ActualWasteQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("La cantidad de merma real descartada no puede ser negativa.");

            item.RuleFor(i => i.ActualReusableQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("La cantidad de subproducto real rescatado no puede ser negativa.");
        });
    }
}
