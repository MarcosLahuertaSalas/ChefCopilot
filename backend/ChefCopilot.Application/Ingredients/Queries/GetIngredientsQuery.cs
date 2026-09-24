using ChefCopilot.Application.Common.Interfaces;
using ChefCopilot.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChefCopilot.Application.Ingredients.Queries;

// 1. LA CONSULTA (La Petición para LEER datos)
// Nota: Devuelve una lista de la entidad Ingredient.
public class GetIngredientsQuery : IRequest<List<Ingredient>>
{
    // Aquí en el futuro podríamos poner filtros, como:
    // public string? SearchName { get; set; }
    // Pero por ahora queremos traer la despensa entera.
}

// 2. EL HANDLER (El que busca los datos)
public class GetIngredientsQueryHandler : IRequestHandler<GetIngredientsQuery, List<Ingredient>>
{
    private readonly IApplicationDbContext _context;

    public GetIngredientsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Ingredient>> Handle(GetIngredientsQuery request, CancellationToken cancellationToken)
    {
        // Le pedimos a MySQL la tabla Ingredients entera
        // .AsNoTracking() es un truco de rendimiento: le dice a EF Core que no gaste 
        // memoria rastreando cambios porque solo vamos a LEER los datos, no a editarlos.
        return await _context.Ingredients
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}
