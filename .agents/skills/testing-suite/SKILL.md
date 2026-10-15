---
name: testing-suite
description: Estrategia y patrones de pruebas automatizadas para ChefCopilot (Backend en C# y Frontend en React). Actívala al redactar tests unitarios para handlers de MediatR, pruebas de escandallos y mermas, validadores de FluentValidation o componentes web.
---

# Estrategia de Pruebas Automatizadas (ChefCopilot)

Esta guía define la metodología de testing para garantizar que la lógica de cálculo de recetas, mermas y pedidos de compra nunca falle ante cambios en el código.

---

## 1. Niveles de Testing

### A. Pruebas Unitarias de Negocio (Backend)
- **Foco principal**: Probar los Handlers de MediatR y las fórmulas matemáticas de hostelería sin depender de una base de datos real.
- **Herramientas**: `xUnit` + `FluentAssertions` + `Moq` (o `NSubstitute`).
- **Casos de prueba críticos**:
  - `GetEventShoppingListQueryHandler`:
    - Verificar que la merma se calcula con $Bruto = Neto / (1 - Merma)$.
    - Comprobar que ingredientes repetidos entre distintos platos del menú se consolidan en una sola línea de compra.
    - Probar valores extremos de merma (0%, mermas normales del 15-30%, mermas introducidas como 20 o como 0.20).
  - Validadores (`FluentValidation`):
    - Comprobar que cantidades negativas o cero en recetas provocan error de validación usando `.ShouldHaveValidationErrorFor()`.

### B. Pruebas de Integración de API
- Probar los controladores HTTP end-to-end usando `WebApplicationFactory<Program>` contra una base de datos de prueba en memoria o contenedor temporal.

### C. Pruebas de Componentes (Frontend)
- **Herramientas**: `Vitest` + `@testing-library/react`.
- Probar que los formularios de ingredientes emiten el evento correcto y que los toasts de `goey-toast` se renderizan al enviar datos válidos.

---

## 2. Convención de Nomenclatura para Tests

Seguir el formato estándar **`Accion_Condicion_ResultadoEsperado`**:
```csharp
[Fact]
public async Task Handle_With20PercentWaste_CalculatesExactGrossQuantity()
{
    // Arrange (Preparación)
    
    // Act (Ejecución)
    
    // Assert (Comprobación con FluentAssertions)
    result.TotalGrossQuantityToBuy.Should().Be(150.0m);
}
```

---

## 3. Comandos de Verificación

```powershell
# Ejecutar todas las pruebas del backend
dotnet test backend/ChefCopilot.slnx

# Ejecutar pruebas del frontend (cuando estén configuradas)
npm run test --prefix frontend
```
