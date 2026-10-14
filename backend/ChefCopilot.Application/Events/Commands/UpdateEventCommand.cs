using ChefCopilot.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Events.Commands;

public class UpdateEventCommand : IRequest
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public int StandardGuests { get; set; }
    public List<Guid> DishIds { get; set; } = new();
}

public class UpdateEventCommandHandler : IRequestHandler<UpdateEventCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateEventCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateEventCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Events
            .Include(e => e.MenuDishes)
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"El evento con ID {request.Id} no existe.");
        }

        entity.Name = request.Name;
        entity.EventDate = request.EventDate;
        entity.StandardGuests = request.StandardGuests;

        // Actualizamos los platos asignados al menú
        var dishes = await _context.Dishes
            .Where(d => request.DishIds.Contains(d.Id))
            .ToListAsync(cancellationToken);

        entity.MenuDishes.Clear();
        foreach (var dish in dishes)
        {
            entity.MenuDishes.Add(dish);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
