using ChefCopilot.Application.Dishes.Commands;
using ChefCopilot.Application.Dishes.Queries;
using Microsoft.AspNetCore.Mvc;

namespace ChefCopilot.WebApi.Controllers;

public class DishesController : BaseController
{
    [HttpGet]
    public async Task<ActionResult<List<DishDto>>> GetAll()
    {
        var dishes = await Mediator.Send(new GetDishesQuery());
        return Ok(dishes);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateDishCommand command)
    {
        var dishId = await Mediator.Send(command);
        return Ok(dishId);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, UpdateDishCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("El ID de la ruta no coincide con el del comando.");
        }

        await Mediator.Send(command);
        return NoContent(); 
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await Mediator.Send(new DeleteDishCommand { Id = id });
        return NoContent(); 
    }
}
