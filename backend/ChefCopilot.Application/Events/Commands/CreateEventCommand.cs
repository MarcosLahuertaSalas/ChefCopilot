using ChefCopilot.Application.Common.Interfaces;
using ChefCopilot.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Events.Commands;

public class CreateEventCommand : IRequest<Guid>
{
    // Ej: "Boda de Alejandro y Beatriz"
    public string Name { get; set; } = string.Empty;

    // Fecha y hora del banquete
    public DateTime EventDate { get; set; }

    // Número de comensales del menú estándar
    public int StandardGuests { get; set; }

    // IDs de los platos que componen el menú de este banquete
    public List<Guid> DishIds { get; set; } = new();
}

public class CreateEventCommandHandler : IRequestHandler<CreateEventCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateEventCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateEventCommand request, CancellationToken cancellationToken)
    {
        // 1. Buscamos los platos que el usuario ha seleccionado para el menú
        var dishes = new List<Dish>();
        if (request.DishIds.Any())
        {
            dishes = await _context.Dishes
                .Where(d => request.DishIds.Contains(d.Id))
                .ToListAsync(cancellationToken);
        }

        // 2. Creamos el nuevo evento con su menú asignado
        var @event = new Event
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            EventDate = request.EventDate,
            StandardGuests = request.StandardGuests,
            MenuDishes = dishes
        };

        _context.Events.Add(@event);

        // 3. Guardamos en la base de datos (se creará el evento y las filas en EventDishes)
        await _context.SaveChangesAsync(cancellationToken);

        return @event.Id;
    }
}
