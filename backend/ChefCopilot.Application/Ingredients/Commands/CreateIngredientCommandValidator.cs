using FluentValidation;

namespace ChefCopilot.Application.Ingredients.Commands;

public class CreateIngredientCommandValidator : AbstractValidator<CreateIngredientCommand>
{
    public CreateIngredientCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("El nombre del ingrediente es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre del ingrediente no puede superar los 100 caracteres.");

        RuleFor(v => v.UnitOfMeasure)
            .NotEmpty().WithMessage("La unidad de medida es obligatoria (ej: Kg, Litros, Unidades).")
            .MaximumLength(20).WithMessage("La unidad de medida no puede superar los 20 caracteres.");

        RuleFor(v => v.WastePercentage)
            .InclusiveBetween(0, 100).WithMessage("El porcentaje de merma debe estar entre 0% y 100% (o entre 0 y 1).");
    }
}
