using ChefCopilot.Application.Ingredients.Commands;
using Microsoft.AspNetCore.Mvc;

namespace ChefCopilot.WebApi.Controllers;

public class IngredientsController : BaseController
{
    // POST api/ingredients
    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateIngredientCommand command)
    {
        // El controlador "idiota": Lo único que hace es tirar el Command a MediatR 
        // y devolver la respuesta. La lógica está en Application.
        var ingredientId = await Mediator.Send(command);
        
        return Ok(ingredientId);
    }
}
