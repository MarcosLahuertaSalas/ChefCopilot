---
name: modern-ui-ux-design
description: Principios de diseño visual, micro-interacciones y estética gastronómica boutique para el frontend de ChefCopilot. Actívala al construir pantallas en React, maquetar componentes con Tailwind v4 o integrar efectos con React Bits y Gooey Toast.
---

# Principios de Diseño Visual & UX Boutique (ChefCopilot)

Esta guía define las reglas de estética y experiencia de usuario para garantizar que ChefCopilot se sienta como una aplicación de alta gama, profesional y con personalidad propia, alejándose por completo del aspecto genérico o plano atribuido a plantillas de IA.

---

## 1. Reglas contra el "AI Template Syndrome"

Evitar estrictamente los siguientes vicios habituales:
- ❌ **No más degradados púrpura/cian fluorescentes sin justificación**.
- ❌ **No a las tarjetas idénticas apiladas sin jerarquía visual clara**.
- ❌ **No a los botones estáticos sin retroalimentación táctil ni micro-estados**.
- ❌ **No a las notificaciones cuadradas convencionales** (usar siempre la física líquida de `goey-toast`).

---

## 2. Paleta de Color Culinaria y Materiales

ChefCopilot se inspira en una cocina profesional de estrella Michelin: carbón, hierro fundido, sartenes de cobre y producto fresco.

- **Fondos (Base)**:
  - Primario: `#070a10` (Negro carbón profundo con matiz frío).
  - Tarjetas y Contenedores: `#0f172a` / `slate-900/90` con bordes sutiles `border-slate-800/80`.
- **Acentos Gastronómicos**:
  - **Cobre / Ámbar Cálido**: `amber-500` / `amber-400` para llamadas a la acción primarias, métricas clave y fuego/calor de cocina.
  - **Verde Fresco / Oliva**: `emerald-400` / `emerald-500` para éxito, validaciones y productos aptos/veganos.
  - **Pizarra Neutra**: `slate-400` para textos secundarios y etiquetas técnicas.
- **Tipografía**:
  - Titulares e impacto numérico: **`Space Grotesk`** (`font-heading`).
  - Textos de lectura y tablas: **`Plus Jakarta Sans`** (`font-sans`).

---

## 3. Micro-interacciones y Animaciones (React Bits & Framer Motion)

1. **Titulares y Cifras de Alto Impacto**:
   - Usar componentes de React Bits (ej: [`SplitText.tsx`](file:///c:/PROYECTOS/ChefCopilot/frontend/src/components/SplitText.tsx)) para entradas de texto escalonadas letra a letra o palabra a palabra.
2. **Notificaciones Orgánicas (`goey-toast`)**:
   - Toda acción del usuario (guardar un ingrediente, recalcular compras, actualizar receta) debe emitir un toast con `gooeyToast.success` o `gooeyToast.warning`.
   - Aprovechar las transiciones líquidas (*blob/pill morphing*) para descripciones enriquecidas.
3. **Sensación Táctil en Botones y Tarjetas**:
   - Efectos de presión: `active:scale-[0.98]` y `hover:border-amber-500/40`.
   - Sombras con color: `shadow-lg shadow-amber-500/10`.

---

## 4. Estructura de Componentes en Frontend

Organizar siempre el código en `frontend/src/` siguiendo **Feature-Driven Architecture**:
- Componentes atómicos de diseño en `src/components/ui/`.
- Componentes con efectos de React Bits en `src/components/animated/`.
- Pantallas y formularios organizados por módulo en `src/features/<modulo>/` (ej: `features/ingredients`, `features/dishes`, `features/events`).
