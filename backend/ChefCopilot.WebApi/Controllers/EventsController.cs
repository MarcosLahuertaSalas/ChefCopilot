using ChefCopilot.Application.Events.Commands;
using ChefCopilot.Application.Events.Common;
using ChefCopilot.Application.Events.Queries;
using Microsoft.AspNetCore.Mvc;

namespace ChefCopilot.WebApi.Controllers;

public class EventsController : BaseController
{
    [HttpGet]
    public async Task<ActionResult<List<EventDto>>> GetAll()
    {
        var events = await Mediator.Send(new GetEventsQuery());
        return Ok(events);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EventDto>> GetById(Guid id)
    {
        var @event = await Mediator.Send(new GetEventByIdQuery { Id = id });
        if (@event == null)
        {
            return NotFound($"No se encontró ningún evento con el ID: {id}");
        }
        return Ok(@event);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateEventCommand command)
    {
        var eventId = await Mediator.Send(command);
        return Ok(eventId);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, UpdateEventCommand command)
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
        await Mediator.Send(new DeleteEventCommand { Id = id });
        return NoContent();
    }

    [HttpGet("{id}/shopping-list")]
    public async Task<ActionResult<EventShoppingListDto>> GetShoppingList(Guid id)
    {
        var shoppingList = await Mediator.Send(new GetEventShoppingListQuery { EventId = id });
        if (shoppingList == null)
        {
            return NotFound($"No se encontró ningún evento con el ID: {id}");
        }
        return Ok(shoppingList);
    }

    [HttpPost("{id}/close")]
    public async Task<ActionResult> Close(Guid id, CloseEventCommand command)
    {
        if (id != command.EventId)
        {
            return BadRequest("El ID de la ruta no coincide con el del comando.");
        }

        await Mediator.Send(command);
        return NoContent();
    }

    [HttpPost("{id}/reopen")]
    public async Task<ActionResult> Reopen(Guid id)
    {
        await Mediator.Send(new ReopenEventCommand { EventId = id });
        return NoContent();
    }

    [HttpGet("{id}/post-mortem")]
    public async Task<ActionResult<EventPostMortemReportDto>> GetPostMortem(Guid id)
    {
        var report = await Mediator.Send(new GetEventPostMortemQuery { EventId = id });
        if (report == null)
        {
            return NotFound($"No se encontró ningún evento con el ID: {id}");
        }
        return Ok(report);
    }
}
