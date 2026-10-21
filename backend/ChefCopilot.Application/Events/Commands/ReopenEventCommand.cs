using ChefCopilot.Application.Common.Interfaces;
using ChefCopilot.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Events.Commands;

public class ReopenEventCommand : IRequest
{
    public Guid EventId { get; set; }
}

public class ReopenEventCommandHandler : IRequestHandler<ReopenEventCommand>
{
    private readonly IApplicationDbContext _context;

    public ReopenEventCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(ReopenEventCommand request, CancellationToken cancellationToken)
    {
        var @event = await _context.Events.FirstOrDefaultAsync(e => e.Id == request.EventId, cancellationToken);
        if (@event == null)
        {
            throw new Exception($"El banquete con ID {request.EventId} no existe.");
        }

        @event.Status = EventStatus.Planned;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
