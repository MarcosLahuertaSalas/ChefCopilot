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

## 2. Paleta de Color Culinaria Editorial & Materiales

ChefCopilot se inspira en una cocina profesional de estrella Michelin y un estudio editorial gastronómico: madera tostada, hierro fundido, encimeras cálidas, corcho y brasas vivas.

- **Fondos (Base & Void)**:
  - **Walnut Shadow** (`#100904` / `--color-walnut`): Lienzo oscuro cálido, el vacío acogedor detrás de la comida. Reemplaza al negro puro `#000000`.
  - **Superficie Elevada** (`#1c120c` / `--color-walnut-surface`): Tarjetas, paneles y modales elevados sobre el lienzo.
  - **Bordes & Separadores** (`#382416` a `#40372e` / `--color-cork-border`): Líneas de separación sutiles y elegantes, evitando bordes grises de plástico.
- **Tipografía y Contraste**:
  - **Warm Cream** (`#ffedd7` / `--color-warm-cream`): Color principal de texto sobre superficies oscuras. Da un tono cálido y orgánico; se prohíbe el blanco frío `#ffffff`.
  - **Driftwood** (`#a89988` / `--color-driftwood`): Texto secundario, unidades de medida y etiquetas complementarias.
- **Acentos Gastronómicos**:
  - **Ember Accent / Ascua** (`#dc5000` / `--color-ember`): Naranja fuego para alertas críticas, detalles y datos de mermas. Usar con moderación y respeto para no saturar.
  - **Cobre / Ámbar Cálido** (`#d97706` / `amber-500`): Botones de acción principal (CTA), totales calculados y estado activo.
  - **Verde Oliva / Hoja** (`#16a34a` / `emerald-500`): Validaciones de escandallos, ingredientes aptos y éxito.
- **Tipografía**:
  - Titulares e impacto numérico: **`Space Grotesk`** (`font-heading`).
  - Textos de lectura, formularios y tablas: **`Plus Jakarta Sans`** (`font-sans`).

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
