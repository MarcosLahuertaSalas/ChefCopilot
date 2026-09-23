using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace ChefCopilot.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Esto busca automáticamente todos los Comandos (Commands) y Consultas (Queries) 
        // de esta capa y se los enchufa a MediatR para que los gestione.
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        
        return services;
    }
}
