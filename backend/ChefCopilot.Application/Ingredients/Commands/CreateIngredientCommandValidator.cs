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
            .InclusiveBetween(0, 100).WithMessage("El porcentaje de desperdicio técnico debe estar entre 0% y 100% (o entre 0 y 1).");

        RuleFor(v => v.ReusableWastePercentage)
            .InclusiveBetween(0, 100).WithMessage("El porcentaje de merma aprovechable debe estar entre 0% y 100% (o entre 0 y 1).");

        RuleFor(v => v.CurrentStock)
            .GreaterThanOrEqualTo(0).WithMessage("El stock actual no puede ser negativo.");

        RuleFor(v => v.MinimumStock)
            .GreaterThanOrEqualTo(0).WithMessage("El stock mínimo de seguridad no puede ser negativo.");

        When(v => v.IsPurchasedByPiece, () =>
        {
            RuleFor(v => v.MinPortionsPerPiece)
                .NotNull().WithMessage("Debe indicar el rendimiento mínimo garantizado de raciones por pieza.")
                .GreaterThan(0).WithMessage("El rendimiento mínimo por pieza debe ser mayor que 0.");

            RuleFor(v => v.MaxPortionsPerPiece)
                .NotNull().WithMessage("Debe indicar el rendimiento máximo de raciones por pieza.")
                .GreaterThanOrEqualTo(v => v.MinPortionsPerPiece ?? 0)
                .WithMessage("El rendimiento máximo de raciones por pieza no puede ser inferior al mínimo.");
        });
    }
}
