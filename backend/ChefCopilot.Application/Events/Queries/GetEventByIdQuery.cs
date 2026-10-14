using ChefCopilot.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Events.Queries;

public class GetEventByIdQuery : IRequest<EventDto?>
{
    public Guid Id { get; set; }
}

public class GetEventByIdQueryHandler : IRequestHandler<GetEventByIdQuery, EventDto?>
{
    private readonly IApplicationDbContext _context;

    public GetEventByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EventDto?> Handle(GetEventByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Events
            .Include(e => e.MenuDishes)
            .Where(e => e.Id == request.Id)
            .Select(e => new EventDto
            {
                Id = e.Id,
                Name = e.Name,
                EventDate = e.EventDate,
                StandardGuests = e.StandardGuests,
                MenuDishes = e.MenuDishes.Select(d => new EventDishDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Category = d.Category
                }).ToList()
            })
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);
    }
}
