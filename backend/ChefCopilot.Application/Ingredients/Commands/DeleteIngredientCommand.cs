using ChefCopilot.Application.Common.Interfaces;
using MediatR;

namespace ChefCopilot.Application.Ingredients.Commands;

public class DeleteIngredientCommand : IRequest
{
    public Guid Id { get; set; }
}

public class DeleteIngredientCommandHandler : IRequestHandler<DeleteIngredientCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteIngredientCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteIngredientCommand request, CancellationToken cancellationToken)
    {
        // 1. Buscamos el ingrediente
        var entity = await _context.Ingredients.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"El ingrediente con ID {request.Id} no existe.");
        }

        // 2. Lo borramos
        _context.Ingredients.Remove(entity);

        // 3. Guardamos los cambios
        await _context.SaveChangesAsync(cancellationToken);
    }
}
