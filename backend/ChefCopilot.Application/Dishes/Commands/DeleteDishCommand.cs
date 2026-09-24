using ChefCopilot.Application.Common.Interfaces;
using MediatR;

namespace ChefCopilot.Application.Dishes.Commands;

public class DeleteDishCommand : IRequest
{
    public Guid Id { get; set; }
}

public class DeleteDishCommandHandler : IRequestHandler<DeleteDishCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteDishCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteDishCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Dishes.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"El plato con ID {request.Id} no existe.");
        }

        _context.Dishes.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
