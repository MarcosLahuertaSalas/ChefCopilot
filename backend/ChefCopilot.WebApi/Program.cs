using ChefCopilot.Infrastructure;
using ChefCopilot.Application;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// AQUÍ INYECTAMOS TODA NUESTRA INFRAESTRUCTURA DE GOLPE
builder.Services.AddInfrastructure(builder.Configuration);

// Y AQUÍ NUESTRA CAPA DE APLICACIÓN (MediatR)
builder.Services.AddApplication();

builder.Services.AddOpenApi();
builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // Añade la web visual para probar la API
}

app.UseHttpsRedirection();

// Registramos las rutas de los controladores
app.MapControllers();

app.Run();
