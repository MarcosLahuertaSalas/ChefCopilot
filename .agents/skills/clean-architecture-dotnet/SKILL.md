---
name: clean-architecture-dotnet
description: Guía de buenas prácticas y arquitectura limpia para el backend en .NET 9 de ChefCopilot. Actívala al crear nuevos comandos, consultas CQRS con MediatR, configuraciones de Entity Framework Core o validaciones con FluentValidation.
---

# Clean Architecture & CQRS en .NET (.NET 9 / ChefCopilot)

Esta guía define las reglas de diseño y estándares de ingeniería para mantener el backend de ChefCopilot desacoplado, modular y de alto rendimiento.

---

## 1. Reglas de Capas y Dependencias

Las dependencias siempre fluyen hacia adentro (hacia el Dominio):

1. **`ChefCopilot.Domain` (El Núcleo)**:
   - Solo contiene entidades puras, enumerados y lógica de dominio.
   - **Regla estricta**: Cero dependencias externas (ni EF Core, ni ASP.NET, ni paquetes de terceros).
2. **`ChefCopilot.Application` (Los Casos de Uso)**:
   - Contiene Comandos (Commands), Consultas (Queries), DTOs, Validadores e Interfaces (`IApplicationDbContext`).
   - Depende únicamente de `Domain` y librerías de aplicación (`MediatR`, `FluentValidation`).
3. **`ChefCopilot.Infrastructure` (La Implementación Externa)**:
   - Implementa interfaces de la capa de aplicación (DbContext, migraciones, proveedores externos).
   - Depende de `Application` y `Domain`.
4. **`ChefCopilot.WebApi` (El Punto de Entrada)**:
   - Controladores HTTP, middlewares y configuración del contenedor de dependencias (`Program.cs`).
   - No contiene lógica de negocio; solo delega en MediatR.

---

## 2. Patrón CQRS con MediatR

- **Commands (Mutación de datos)**:
  - Nomenclatura: `Create[Entity]Command`, `Update[Entity]Command`, `Delete[Entity]Command`.
  - Cada comando debe tener su validador asociado heredando de `AbstractValidator<TCommand>`.
- **Queries (Lectura de datos)**:
  - Nomenclatura: `Get[Entity]sQuery`, `Get[Entity]ByIdQuery`.
  - **Optimización obligatoria**: Utilizar siempre `.AsNoTracking()` para no saturar el Change Tracker de EF Core.
  - **DTOs limpios**: Nunca devolver entidades de base de datos directas. Proyectar siempre con `.Select(e => new EntityDto { ... })` para evitar bucles circulares de serialización JSON y no exponer datos internos.

---

## 3. Validaciones y Manejo Defensivo

- Toda mutación que reciba datos del cliente debe validarse con **FluentValidation**.
- Las validaciones se ejecutan de forma automática en el pipeline (`ValidationBehavior.cs`).
- En caso de fallo, se lanza `ValidationException`, que el `ExceptionHandlingMiddleware` transforma en una respuesta HTTP `400 Bad Request` estándar con formato `HttpValidationProblemDetails` (RFC 7807).

---

## 4. Checklist para Nuevos Módulos

Al añadir una nueva entidad o funcionalidad:
- [ ] Definir entidad en `ChefCopilot.Domain/Entities/`.
- [ ] Añadir `DbSet<T>` en `IApplicationDbContext.cs` y en `ChefCopilotDbContext.cs`.
- [ ] Crear migración EF Core (`dotnet ef migrations add ...`) y aplicar con `dotnet ef database update`.
- [ ] Crear Comandos y Consultas CQRS en `ChefCopilot.Application/<Modulo>/`.
- [ ] Añadir validadores correspondientes con FluentValidation.
- [ ] Crear controlador delgado en `ChefCopilot.WebApi/Controllers/` heredando de `BaseController`.
