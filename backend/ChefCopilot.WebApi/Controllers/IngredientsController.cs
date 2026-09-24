using ChefCopilot.Application.Ingredients.Commands;
using ChefCopilot.Application.Ingredients.Queries;
using ChefCopilot.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace ChefCopilot.WebApi.Controllers;

public class IngredientsController : BaseController
{
    // GET api/ingredients
    [HttpGet]
    public async Task<ActionResult<List<Ingredient>>> GetAll()
    {
        var ingredients = await Mediator.Send(new GetIngredientsQuery());
        return Ok(ingredients);
    }

    // POST api/ingredients
    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateIngredientCommand command)
    {
        var ingredientId = await Mediator.Send(command);
        return Ok(ingredientId);
    }

    // PUT api/ingredients/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, UpdateIngredientCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("El ID de la ruta no coincide con el del comando.");
        }

        await Mediator.Send(command);
        return NoContent(); // 204 NoContent es el estándar para un Update exitoso sin devolver datos
    }

    // DELETE api/ingredients/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await Mediator.Send(new DeleteIngredientCommand { Id = id });
        return NoContent(); // 204 NoContent para Delete exitoso
    }
}
