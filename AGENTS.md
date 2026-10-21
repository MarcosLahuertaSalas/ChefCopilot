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
- **Estilos**: Tailwind CSS v4 con paleta editorial gastronómica unificada (idéntica a la Landing Page):
  - *Lino Culinario Base* (`#f4efe6`), *Superficie Lino Tostado* (`#ebe4d5`), *Tarjetas Blancas Cálidas* (`#ffffff` / `#fdfbf7`).
  - *Tinta Carbón de Brasa* (`#18251e`) para máxima legibilidad tipográfica y contraste suave.
  - *Terracota / Coñac Culinario* (`#5a341e` / hover `#472917`) y *Verde Bosque Chef* (`#18241d`).
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
- Estética gastronómica boutique unificada con la Landing Page (Lino Culinario `#f4efe6`, Tinta Carbón `#18251e`, Terracota `#5a341e`, Verde Bosque `#18241d`, Superficies `#ebe4d5`).
- Probado y verificado en navegador con `browser_subagent`.

### Módulo de Autenticación & Usuarios (Backend Completo)
- `User`: Id, Email (único), PasswordHash, FullName, RestaurantName, Role, CreatedAt.
- **Hashing Criptográfico**: `PasswordHasher.cs` con PBKDF2 SHA-256 (100.000 iteraciones, salt de 128 bits) y comparación en tiempo constante  (*fixed-time*) para prevenir timing attacks.
- **CQRS**: `RegisterUserCommand`, `RegisterUserCommandValidator`, `LoginUserCommand`, `LoginUserCommandValidator`.
- **Endpoints**: `POST /api/auth/register`, `POST /api/auth/login` en `AuthController.cs`.
- Migración aplicada: `20261018191500_AddUserEntity` en MySQL.

### Módulo de Portada, Mascota JuankiA & Asistente IA (Frontend Completo) ✅
- **Mascota JuankiA 3D (React Three Fiber + Three.js)**: `frontend/src/components/JuankiA3D.tsx`.
  - Carga el modelo 3D optimizado `public/olla.glb` (2.1 MB de geometría pura sin texturas pesadas).
  - **Materiales PBR Asignados por Código**:
    - **Olla**: `MeshStandardMaterial` color carbón/barro cálido (`#2b2623`), rugosidad `roughness: 0.68`, metalicidad `metalness: 0.08`, con textura de micro-relieve procedimental (`bumpMap` táctil) y luz de brasa/fuego ámbar cálido (`#ff8c1a`) en el lateral izquierdo.
    - **Gorro**: `MeshStandardMaterial` marfil/masa horneada cálida (`#ede3d1`), rugosidad `roughness: 0.88` (algodón textil de cocina).
  - **Ojos y Pupilas Procedurales 3D Agrandados**: Ojos grandes, expresivos y tiernos con cuenca crema sutil (`radius: 0.116`), gran pupila negra brillante (`radius: 0.104`) y destellos especulares duales ampliados.
  - **Seguimiento Global en Toda la Pantalla (`window.mousemove` + `useFrame`)**: La orientación 3D del cuerpo y las pupilas siguen matemáticamente el cursor por cualquier rincón del monitor, sin limitarse al recuadro del canvas.
  - **Ojos Siempre Abiertos**: Mirada siempre atenta, fija y nítida (sin parpadeos).
  - **Burbuja de Diálogo On-Demand y Salto Físico**:
    - JuankiA carga completamente despejado para admirar el modelo 3D y su gorro de chef, acompañado de una discreta insignia interactiva *"¡Hola Chef! · Toca aquí"*.
    - Al hacer clic en JuankiA o en la insignia, salta elásticamente con amortiguación y balanceo, y despliega el bocadillo de consejos técnicos culinarios.
  - **Integración sin Recuadros**: El modelo 3D flota limpiamente y sin recuadros sobre el fondo lino de la landing page con sombra de contacto natural (`ContactShadows`).
- **Página de Inicio & Storytelling por Scroll**: `frontend/src/features/landing/LandingPage.tsx`.
  - **Titular WebGL Interactivo React Bits (`WarpText.tsx` + `ogl`)**: Titular monumental `CHEF COPILOT` con shader WebGL de refracción óptica, curvatura dinámica al paso del puntero y ondas de choque líquidas.
  - **Revelado por Scroll React Bits (`AnimatedContent.tsx` + GSAP ScrollTrigger)**: Entradas cinematográficas con traslación vertical y suave inclinación 3D (*tilt*) en los 3 pilares de ingeniería gastronómica y en las tarjetas del flujo de trabajo.
  - **Sección Narrativa "¿Para qué sirve ChefCopilot?"**: 3 pilares técnicos fundamentales (Doble Merma Técnica con rescate de subproducto, Regla del Chef por Piezas con colchón de seguridad para banquetes, y Deducción de Stock Físico en Cámara con alertas de stock crítico).
  - **Flujo de Trabajo Culinario en 3 Pasos**: Despensa Técnica -> Ficha de Recetas -> Banquetes & Lista de Compras en Vivo.
  - **Armonización de Estilos**: Botón del banner CTA final integrado en paleta *Warm Cream* (`#ffedd7`) sobre carbón/verde bosque (`#18241d`), eliminando degradados estridentes.
  - **Botón Flotante Reactivo al Scroll**: Transiciona entre `DESCUBRE ↘` (scroll suave hacia la historia) y `SUBIR ↑` (regreso al Hero con JuankiA).
- **Mascota JuankiA 2D Transparente**: Recorte limpio en `public/juankia-logo.png` sin fondos grises para el encabezado y avatares.
- **Widget Flotante de Asistente IA JuankiA**: `frontend/src/components/JuankiAChatWidget.tsx`.
- **Autenticación en Frontend**: `frontend/src/features/auth/AuthModal.tsx` conectado a .NET 9 + MySQL.


### Módulo de Excepciones Dietéticas & Menús Especiales por Banquete (Completo) ✅
- `EventDietaryRequirement`: `RequirementName` (Celíaco, Vegano, Alergia), `GuestCount`, `ReplacedDishId` (plato omitido del menú), `SubstituteDishId` (plato alternativo a preparar) y `Notes` específicas de pase/sala.
- **Relaciones EF Core 9 & Migración MySQL**:
  - `20261021192039_AddEventDietaryRequirements` aplicada en MySQL (`EventDietaryRequirements` con Cascade delete sobre Event y SetNull sobre Dish).
- **Lógica de Escandallado Dinámico de Partida**:
  - `GetEventShoppingListQuery`: desglosa comensales totales en estándar y especiales.
  - Descuenta comensales de los platos reemplazados: $\text{Raciones Plato Estándar} = \max(0, \text{Comensales Base} - \text{Comensales Reemplazados})$.
  - Suma raciones de platos sustitutos: $\text{Raciones Plato Sustituto} = \text{Comensales Especiales}$.
  - Resuelve platos sustitutos aunque no formen parte del menú general del evento y consolida sus ingredientes con mermas técnicas, subproducto reutilizable y compras por piezas enteras.
- **Ficha de Pase de Partida (Kitchen Brigade Pass Sheet)**:
  - Nueva tabla interactiva desplegable en frontend con raciones exactas a cocinar por plato, notas de cocina y advertencias de sustitución.
- **Modal de Gestión Reactivo (`EventModal.tsx`)**:
  - Presets de 1 clic: *🌾 Celíaco / Sin Gluten*, *🌿 Vegano*, *🥛 Sin Lactosa*, *🥜 Alergia Frutos Secos*, *🦐 Alergia Mariscos*.
  - Balanza de comensales en vivo con distribución: *X estándar + Y especiales = Total pax*.
  - Selectores inteligentes: platos del menú para omitir y recetario completo para sustituir.
- **Exportación a Sala / WhatsApp**:
  - Botón "Copiar Pedido & Pase" formatea el desglose de comensales especiales, ficha de pase de cocina y pedido a proveedores listo para enviar.

### Módulo de Cierre de Banquete & Auditoría de Mermas Reales (Post-Mortem Culinario) (Completo) ✅
- **Entidades & Modelo de Dominio**:
  - `Event.Status`: Enum `EventStatus` (`Planned`, `Completed`).
  - `Event.CompletedAt` y `Event.PostMortemNotes`.
  - `EventPostMortemItem`: Auditoría por ingrediente con consumo bruto planificado, merma teórica prevista vs. merma real descartada (basura), subproducto teórico previsto vs. subproducto real rescatado (aprovechado), desviación porcentual, notas de partida y bandera `AppliedToPantry`.
- **Relaciones EF Core 9 & Migración MySQL**:
  - `20261021194655_AddEventPostMortemAudit` aplicada en MySQL.
- **CQRS en Backend (.NET 9 + FluentValidation)**:
  - `CloseEventCommand` y `CloseEventCommandValidator`: registra los pesajes reales de cocina, calcula desviaciones matemáticas y, si el chef lo indica, actualiza en vivo los coeficientes técnicos de la despensa (`Ingredient.WastePercentage` y `ReusableWastePercentage`).
  - `ReopenEventCommand`: permite reabrir un banquete a estado `Planned` ante correcciones.
  - `GetEventPostMortemQuery`: genera el informe post-mortem con Kilos de basura reales, Kilos de subproducto rescatado y el **Índice de Control Técnico del Chef (%)**.
- **Frontend & Auditoría Interactiva (`PostMortemModal.tsx` + `EventsView.tsx`)**:
  - Insignia de estado interactiva en la lista de banquetes (*Planificado* vs. *Finalizado / Auditado*).
  - Botón "Cerrar Banquete & Auditoría" con modal de pesaje en tiempo real.
  - KPIs en vivo con semáforos de ahorro de merma o exceso de desperdicio.
  - Banner en la ficha de banquete con las notas y fecha de cierre del chef, más opciones de "Ver Auditoría Post-Mortem" y "Reabrir".
  - Alineación visual 100% simétrica de 3 columnas (Merma Descartada, Subproducto Rescatado, Calibrar Despensa) y edición de inputs numéricos sin bloqueos de ceros (`onFocus select` y limpieza libre con Backspace en `PostMortemModal`, `EventModal` y `DishModal`).

---

## 4. Trabajo Pendiente / Próximos Pasos (Roadmap Prioritario) 🎯

1. **Ciclo Completo de Autenticación, JWT & Sesión Multi-restaurante en Frontend**:
   - Backend ya listo con PBKDF2 SHA-256 (`AuthController.cs`, `User`, MySQL).
   - Generación de token JWT en el backend y persistencia en React.
   - Protección de vistas y aislamiento de datos por `RestaurantId`.
   - Asignación y gestión de roles culinarios (Chef Ejecutivo, Sous-Chef, Encargado de Compras).

2. **Conexión de JuankiA con Asistente LLM en Streaming**:
   - Conectar el widget interactivo `JuankiAChatWidget.tsx` a un endpoint de streaming en tiempo real (Server-Sent Events / SSE o WebSockets).
   - Prompt de sistema especializado como Sous-Chef Ejecutivo: experto en conversiones de unidades culinarias, puntos de cocción, sustitución de alérgenos y rescate de mermas.

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
