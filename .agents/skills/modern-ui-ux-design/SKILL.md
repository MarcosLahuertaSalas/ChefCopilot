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

ChefCopilot se inspira en una cocina profesional boutique y una revista editorial gastronómica de alta gama: lino orgánico cálido, madera de nogal, hierro fundido, terracota/coñac y hierbas frescas.

- **Fondos & Superficies (Lienzo Culinario Lino)**:
  - **Linen Base** (`#f4efe6` / `--color-linen`): Lienzo claro y cálido que emula el papel artesanal de un cuaderno de recetas o mandil de lino. Reemplaza tanto al blanco clínico `#ffffff` como al negro genérico.
  - **Superficie Elevada / Lino Tostado** (`#ebe4d5` / `--color-linen-surface`): Cabeceras de tablas, barras de navegación secundarias y contenedores técnicos agrupados.
  - **Tarjetas & Paneles** (`#ffffff` / `--color-linen-card` o `#fdfbf7`): Tarjetas limpias de alto contraste con sombras suaves (`shadow-sm`) y bordes orgánicos sutiles.
  - **Bordes & Separadores** (`rgba(24, 37, 30, 0.10)` a `0.15` / `--color-cork-border`): Líneas de separación sutiles y elegantes.
- **Tipografía y Contraste**:
  - **Culinary Ink / Carbón de Brasa** (`#18251e` / `--color-ink`): Color principal de texto y titulares. Un negro carbón boscoso de altísima legibilidad y suavidad visual.
  - **Muted Stone / Madera Seca** (`#524d45` y `#726e66` / `--color-ink-muted`): Texto secundario, unidades de medida y etiquetas complementarias.
- **Acentos Gastronómicos**:
  - **Terracota / Coñac Culinario** (`#5a341e` / `--color-terracotta`): Botones de acción principal (CTA), totales calculados, iconos de impacto y estado activo en recetario.
  - **Verde Hoja / Fresh Herb** (`text-emerald-800` / `bg-emerald-50` / `border-emerald-200`): Subproductos aprovechables para caldos/albóndigas, dietas veganas/vegetarianas y estados cubiertos en stock.
  - **Alerta Técnica / Basura** (`text-rose-700` / `bg-rose-50` / `border-rose-200`): Desperdicio técnico neto y avisos de stock bajo mínimo de seguridad.
  - **Bosque Chef Profundo** (`#18241d` / `--color-forest`): Botones oscuros institucionales y pestañas activas de alta jerarquía.
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
