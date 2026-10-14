using ChefCopilot.Application.Common.Interfaces;
using MediatR;

namespace ChefCopilot.Application.Events.Commands;

public class DeleteEventCommand : IRequest
{
    public Guid Id { get; set; }
}

public class DeleteEventCommandHandler : IRequestHandler<DeleteEventCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteEventCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteEventCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Events.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"El evento con ID {request.Id} no existe.");
        }

        _context.Events.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
