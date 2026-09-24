using ChefCopilot.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Dishes.Commands;

public class UpdateDishCommand : IRequest
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    // Opcional: Podríamos permitir modificar la lista de ingredientes aquí
}

public class UpdateDishCommandHandler : IRequestHandler<UpdateDishCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateDishCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateDishCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Dishes.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"El plato con ID {request.Id} no existe.");
        }

        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.Category = request.Category;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
