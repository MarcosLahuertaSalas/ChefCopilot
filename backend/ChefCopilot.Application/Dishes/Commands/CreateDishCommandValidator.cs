using FluentValidation;

namespace ChefCopilot.Application.Dishes.Commands;

public class CreateDishCommandValidator : AbstractValidator<CreateDishCommand>
{
    public CreateDishCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("El nombre del plato es obligatorio.")
            .MaximumLength(150).WithMessage("El nombre del plato no puede superar los 150 caracteres.");

        RuleFor(v => v.Category)
            .NotEmpty().WithMessage("La categoría del plato es obligatoria (ej: Entrantes, Principales, Postres).");

        RuleFor(v => v.Ingredients)
            .NotEmpty().WithMessage("El plato debe tener al menos un ingrediente en su receta.");

        RuleForEach(v => v.Ingredients).ChildRules(ingredient =>
        {
            ingredient.RuleFor(i => i.IngredientId)
                .NotEmpty().WithMessage("El ID del ingrediente es obligatorio.");

            ingredient.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("La cantidad del ingrediente debe ser mayor que cero.");
        });
    }
}
