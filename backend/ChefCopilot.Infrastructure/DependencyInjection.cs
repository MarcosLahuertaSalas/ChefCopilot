using ChefCopilot.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ChefCopilot.Infrastructure;

public static class DependencyInjection
{
    // Este método es un "método de extensión" para inyectar todo lo de la infraestructura de golpe
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Leemos la cadena de conexión de appsettings.json
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        // 2. Registramos el DbContext indicándole que use MySQL
        services.AddDbContext<ChefCopilotDbContext>(options =>
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

        // 3. Atamos la interfaz limpia a nuestra implementación sucia de base de datos
        services.AddScoped<ChefCopilot.Application.Common.Interfaces.IApplicationDbContext>(provider => 
            provider.GetRequiredService<ChefCopilotDbContext>());

        // 4. Servicio criptográfico de hashing de contraseñas
        services.AddSingleton<ChefCopilot.Application.Common.Interfaces.IPasswordHasher, ChefCopilot.Infrastructure.Services.PasswordHasher>();

        return services;
    }
}
