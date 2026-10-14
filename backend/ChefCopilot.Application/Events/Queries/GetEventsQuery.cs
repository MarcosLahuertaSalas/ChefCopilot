using ChefCopilot.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Events.Queries;

public class EventDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public int StandardGuests { get; set; }
    public List<EventDishDto> MenuDishes { get; set; } = new();
}

public class EventDishDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class GetEventsQuery : IRequest<List<EventDto>> { }

public class GetEventsQueryHandler : IRequestHandler<GetEventsQuery, List<EventDto>>
{
    private readonly IApplicationDbContext _context;

    public GetEventsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<EventDto>> Handle(GetEventsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Events
            .Include(e => e.MenuDishes)
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
            .ToListAsync(cancellationToken);
    }
}
