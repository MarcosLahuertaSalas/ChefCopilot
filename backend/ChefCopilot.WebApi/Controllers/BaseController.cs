using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace ChefCopilot.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    private IMediator? _mediator;

    // Patrón heredado de tu estilo en QUBEX: 
    // Pedimos el Mediator directamente al contexto HTTP si no existe, 
    // así no ensucia el constructor de todos los controladores hijos.
    protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<IMediator>();
}
