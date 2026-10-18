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
- **Estilos**: Tailwind CSS v4 con paleta editorial gastronómica cálida:
  - *Walnut Shadow* (`#100904`), *Superficie Nogal* (`#1c120c`), *Borde Corcho* (`#40372e`).
  - *Warm Cream* (`#ffedd7`) para tipografía cálida, *Ember/Ascua* (`#dc5000`) y *Ámbar* (`#d97706`).
- **Tipografías**: *Space Grotesk* (titulares) y *Plus Jakarta Sans* (cuerpo).
- **Animaciones y Micro-interacciones**:
  - **React Bits**: Componentes animados en código fuente (ej: `SplitText.tsx` con GSAP). Registro configurado en `components.json`.
  - **Gooey Toast**: Notificaciones con físicas líquidas orgánicas (*blob morphing* con Framer Motion).
- **Arquitectura de Frontend**:
  - `src/types/`: DTOs TypeScript sincronizados con C# (`ingredient.ts`, `dish.ts`, `event.ts`).
  - `src/api/`: Cliente HTTP base con gestión de errores RFC 7807 (`client.ts`, `ingredients.ts`, `dishes.ts`, `events.ts`).
  - `src/components/`: Componentes UI y animados (`ui/`, `animated/`).
  - `src/features/`: Módulos de negocio (`features/ingredients`, `features/dishes`, `features/events`).
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

### Módulo de Ingredientes & Inventario Técnico (CRUD Completo)
- `Ingredient`: Nombre, unidad de medida, proveedor y alérgenos.
- **Doble Merma Culinaria**: Desperdicio técnico neto (`WastePercentage`, basura inútil) y merma técnica aprovechable (`ReusableWastePercentage`, recortes de carne para albóndigas, espinas/huesos para fondos y caldos).
- **Control de Inventario**: Stock físico en cámara (`CurrentStock`) y stock mínimo de seguridad (`MinimumStock`).
- **Compra por Piezas Enteras**: Rendimiento mínimo garantizado (`MinPortionsPerPiece`, cálculo pesimista del chef) y rendimiento máximo (`MaxPortionsPerPiece`).
- Migración aplicada: `20261018174459_AddInventoryAndPieceYield` en MySQL.

### Módulo de Platos y Recetas (CRUD Completo)
- Composición de platos con ingredientes y porciones individuales (`DishIngredients`).
- Gestión completa de altas, modificaciones y bajas en `DishesController` y `DishesView.tsx`.

### Módulo de Eventos & Calculadora de Escandallos en Vivo
- Endpoint: `GET /api/events/{id}/shopping-list` (`GetEventShoppingListQuery.cs`).
- Consolida ingredientes repetidos entre platos del menú para los $N$ comensales.
- **Fórmula de Mermas Reales**: $\text{Bruto} = \frac{\text{Neto}}{1 - (\text{Waste} + \text{ReusableWaste})}$.
- **Cálculo de Subproducto Reutilizable**: Cuantifica en Kg la carne/recortes disponibles para albóndigas/caldos.
- **Deducción de Stock en Cámara**: $\text{A Pedir} = \max(0, \text{Bruto Requerido} - \text{Stock Actual})$.
- **Alertas de Stock Crítico**: Detecta si el stock actual o el proyectado tras el evento cae por debajo del stock mínimo.
- **Regla del Chef para Piezas Enteras**: Calcula las piezas a pedir usando el rendimiento mínimo garantizado ($\lceil \frac{\text{Raciones}}{\text{MinPortionsPerPiece}} \rceil$), y calcula el colchón de seguridad de raciones extra para tranquilidad de la cocina.

### Frontend Completo por Features (React 19 + Tailwind v4 + Gooey Toast)
- `src/features/ingredients/`: Despensa con tabla de stock, avisos de bajo mínimo, desglose de mermas y modal reactivo.
- `src/features/dishes/`: Recetario interactivo con asignación de porciones y fichas técnicas.
- `src/features/events/`: Planificador de banquetes y visor de la lista de compra en tiempo real con alertas, botón para copiar pedido formateado y opción de imprimir.
- Estética culinaria cálida (Walnut Shadow `#100904`, Warm Cream `#ffedd7`, Ember `#dc5000`, Cork Border `#40372e`).
- Probado y verificado en navegador con `browser_subagent`.

### Módulo de Autenticación & Usuarios (Backend Completo)
- `User`: Id, Email (único), PasswordHash, FullName, RestaurantName, Role, CreatedAt.
- **Hashing Criptográfico**: `PasswordHasher.cs` con PBKDF2 SHA-256 (100.000 iteraciones, salt de 128 bits) y comparación en tiempo constante (*fixed-time*) para prevenir timing attacks.
- **CQRS**: `RegisterUserCommand`, `RegisterUserCommandValidator`, `LoginUserCommand`, `LoginUserCommandValidator`.
- **Endpoints**: `POST /api/auth/register`, `POST /api/auth/login` en `AuthController.cs`.
- Migración aplicada: `20261018191500_AddUserEntity` en MySQL.

### Módulo de Portada, Mascota JuankiA & Asistente IA (Frontend Completo) ✅
- **Mascota JuankiA**: Cazuela tradicional de hierro con gorro de chef y ojos animados expresivos (`frontend/src/components/JuankiAMascot.tsx`).
  - **Seguimiento Ocular 2.5D**: Pupilas procedurales con traslación matemática (`atan2` + distancia acotada) que siguen el cursor del ratón en tiempo real.
  - **Efecto Parallax 3D**: Inclinación reactiva mediante perspectiva CSS (`perspective(1000px) rotateX/rotateY`) que da volumen 3D real sin necesidad de modelos pesados Three.js ni suscripciones de pago.
  - **Pestañeo Orgánico**: Intervalo natural cada 4.5s con brillos especulares duales en la pupila.
- **Página de Inicio (Figma Replica)**: `frontend/src/features/landing/LandingPage.tsx`.
  - Réplica exacta de la composición de Figma Make: fondo lino alabastro cálido (`#f4efe6`), titulares monumentales `CHEF` (`#18251e`) / `COPILOT` (`#5a341e`), separador con indicador `01`, tarjeta de JuankiA con etiquetas "TU COPILOTO" y "Siempre atento a tu cocina", margen derecho vertical "TU COCINA · EN ORDEN" y botón flotante "DESCUBRE".
- **Widget Flotante de Asistente IA JuankiA**: `frontend/src/components/JuankiAChatWidget.tsx`.
  - Asistente flotante permanente en el espacio de trabajo culinario. Permite al chef consultar dudas de escandallos, rendimientos de solomillo para 80 comensales y gestión de subproductos reutilizables con respuestas instantáneas.
- **Autenticación en Frontend**: `frontend/src/features/auth/AuthModal.tsx` integrado en la cabecera y la landing, conectado a los endpoints `/api/auth/login` y `/api/auth/register`, con persistencia en `localStorage` y selector de roles.

---

## 4. Trabajo Pendiente / Próximos Pasos (Roadmap Inmediato) 🎯

1. **Excepciones Dietéticas por Banquete**:
   - Registrar comensales vegetarianos, celíacos o alérgicos en un evento (ej: 80 pax estándar, 5 celíacos, 3 veganos).
   - Sustituir automáticamente platos o recalcular ingredientes según restricciones.
2. **Histórico y Registro de Mermas Reales tras el Evento**:
   - Tras terminar el banquete, registrar cuánto se reutilizó realmente (ej: "Se obtuvieron 3.8 Kg de carne para albóndigas") para afinar los porcentajes de merma histórica.
3. **Conexión de JuankiA con LLM en Streaming**:
   - Conectar el widget de chat de JuankiA con una API de lenguaje en streaming para responder cualquier duda técnica de cocina en tiempo real.

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
