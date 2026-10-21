using ChefCopilot.Application.Common.Interfaces;
using ChefCopilot.Application.Events.Common;
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
            .Include(e => e.DietaryRequirements)
                .ThenInclude(dr => dr.ReplacedDish)
            .Include(e => e.DietaryRequirements)
                .ThenInclude(dr => dr.SubstituteDish)
            .Where(e => e.Id == request.Id)
            .Select(e => new EventDto
            {
                Id = e.Id,
                Name = e.Name,
                EventDate = e.EventDate,
                StandardGuests = e.StandardGuests,
                Status = e.Status.ToString(),
                CompletedAt = e.CompletedAt,
                PostMortemNotes = e.PostMortemNotes,
                MenuDishes = e.MenuDishes.Select(d => new EventDishDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Category = d.Category
                }).ToList(),
                DietaryRequirements = e.DietaryRequirements.Select(dr => new EventDietaryRequirementDto
                {
                    Id = dr.Id,
                    RequirementName = dr.RequirementName,
                    GuestCount = dr.GuestCount,
                    ReplacedDishId = dr.ReplacedDishId,
                    ReplacedDishName = dr.ReplacedDish != null ? dr.ReplacedDish.Name : null,
                    SubstituteDishId = dr.SubstituteDishId,
                    SubstituteDishName = dr.SubstituteDish != null ? dr.SubstituteDish.Name : null,
                    Notes = dr.Notes
                }).ToList()
            })
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);
    }
}
