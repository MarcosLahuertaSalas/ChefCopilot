# Memoria del Proyecto: ChefCopilot 👨‍🍳📋

> Este archivo sirve como memoria continua (*Context Memory*) para cualquier instancia o agente de IA que trabaje en este repositorio. Se actualiza con el progreso, la arquitectura y las tareas pendientes.

---

## 1. Visión del Proyecto
**ChefCopilot** es una plataforma SaaS de ingeniería gastronómica para cocinas profesionales, restaurantes y servicios de banquetes/catering. Su objetivo principal es automatizar el cálculo de escandallos, controlar mermas técnicas de ingredientes y generar pedidos de compra consolidados para eventos y banquetes.

---

## 2. Stack Tecnológico

### Backend (.NET 9)
- **Arquitectura**: Clean Architecture + Vertical Slices con patrón CQRS.
- **Mediador**: MediatR 14.
- **Acceso a Datos**: Entity Framework Core 9 con MySQL 8.0 (en Docker, puerto `3307`).
- **Validaciones**: FluentValidation 12 integrado en el pipeline de MediatR (`ValidationBehavior.cs`).
- **Manejo de Errores**: `ExceptionHandlingMiddleware` devolviendo `HttpValidationProblemDetails` (RFC 7807) en código 400.
- **Documentación Interactiva**: Scalar UI en `http://localhost:5236/scalar/v1`.

### Frontend (React 19)
- **Entorno**: Vite 8 + TypeScript + React 19.
- **Estilos**: Tailwind CSS v4 + Tipografías *Space Grotesk* (titulares) y *Plus Jakarta Sans* (cuerpo).
- **Animaciones y Micro-interacciones**:
  - **React Bits**: Componentes animados en código fuente (ej: `SplitText.tsx` con GSAP). Registro configurado en `components.json`.
  - **Gooey Toast**: Notificaciones con físicas líquidas orgánicas (*blob morphing* con Framer Motion).
- **Proxy de Desarrollo**: `frontend/vite.config.ts` redirige automáticamente `/api` a `http://localhost:5236`.

### MCP Servers y Skills
- **Configuración MCP**: En `~/.gemini/config/mcp_config.json` (shadcn, MySQL y Figma).
- **Skills del Proyecto** (en `.agents/skills/`):
  1. `clean-architecture-dotnet`: Estándares de CQRS, DTOs y EF Core.
  2. `modern-ui-ux-design`: Guía visual culinaria boutique (carbón, cobre, ámbar; anti-plantilla IA).
  3. `security-auditor`: Prevención de inyección SQL, validación estricta y protección de credenciales.
  4. `testing-suite`: Estrategia de testing unitario y de escandallos.

---

## 3. Estado Actual: Lo que está HECHO y PROBADO ✅

### Módulo de Ingredientes (CRUD Completo)
- `Ingredient`: Nombre, unidad de medida, merma (`WastePercentage`), proveedor y alérgenos.
- Regla de negocio: `IsVegetarian` e `IsVegan` inicializan en `false` por seguridad alimentaria.
- Endpoints en `IngredientsController`: `GET`, `POST`, `PUT`, `DELETE`.

### Módulo de Platos y Recetas (CRUD Completo)
- Relación muchos a muchos entre Platos e Ingredientes mediante `DishIngredient` (con porciones exactas).
- `CreateDishCommand` y `UpdateDishCommand`: Crean y sincronizan la lista de ingredientes y cantidades de una receta en la base de datos.
- `GetDishesQuery`: Proyecta a `DishDto` con `.Include()` y `.AsNoTracking()` sin referencias circulares.
- Endpoints en `DishesController`: `GET`, `POST`, `PUT`, `DELETE`.

### Módulo de Eventos y Banquetes (CRUD Completo)
- Relación muchos a muchos entre Eventos y Platos mediante tabla intermedia `EventDishes` (migración `ConfigureEventDishesManyToMany`).
- Permite vincular N platos del catálogo al menú de un banquete.
- Endpoints en `EventsController`: `GET`, `GET /{id}`, `POST`, `PUT`, `DELETE`.

### La Calculadora de Escandallos y Compras de Eventos
- Endpoint: `GET /api/events/{id}/shopping-list` (`GetEventShoppingListQuery.cs`).
- Consolida ingredientes repetidos entre platos distintos del menú.
- Multiplica ración $\times$ número de comensales.
- Aplica la fórmula técnica de hostelería: $\text{Cantidad Bruta a Comprar} = \frac{\text{Cantidad Neta}}{1 - \text{Porcentaje de Merma}}$.

### Frontend Inicializado
- Proyecto en `frontend/` funcional, con Tailwind v4 y probado en navegador con `browser_subagent`.

---

## 4. Trabajo Pendiente / Próximos Pasos (Roadmap Inmediato) 🎯

1. **Estructurar el Frontend por Features**:
   - Organizar `frontend/src/` en:
     - `src/api/` (cliente HTTP para comunicarse con el backend .NET).
     - `src/features/ingredients/` (vista, tabla y formulario modal para alta/edición de ingredientes).
     - `src/features/dishes/` (recetario visual con selector dinámico de ingredientes y cantidades).
     - `src/features/events/` (planificador de banquetes y visor de la lista de la compra calculada con opción de exportar/imprimir).
2. **Conectar Pantallas con la API**:
   - Consumir los endpoints reales de .NET desde los componentes de React, disparando notificaciones con `goey-toast` ante cada acción.
3. **Casos Avanzados de Negocio (Backend)**:
   - Excepciones dietéticas por evento (ej: 5 veganos, 2 celíacos en un banquete).
   - Autenticación de usuarios / restaurantes.

---

## 5. Cómo levantar el entorno en un PC nuevo 🚀

1. **Base de Datos (Docker)**:
   ```powershell
   docker-compose up -d
   ```
2. **Backend API (.NET 9)**:
   ```powershell
   dotnet run --project backend/ChefCopilot.WebApi/ChefCopilot.WebApi.csproj --launch-profile "http"
   # Disponible en: http://localhost:5236 | Scalar en: http://localhost:5236/scalar/v1
   ```
3. **Frontend (Vite + React)**:
   ```powershell
   cd frontend
   npm install
   npm run dev
   # Disponible en: http://localhost:5173/
   ```
