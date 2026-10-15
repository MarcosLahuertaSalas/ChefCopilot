---
name: security-auditor
description: Protocolo de auditoría de seguridad para el backend en .NET y el frontend en React de ChefCopilot. Actívala al crear endpoints expuestos, manipular contraseñas o credenciales, configurar CORS o revisar vulnerabilidades en dependencias.
---

# Protocolo de Auditoría de Seguridad (ChefCopilot)

Esta guía define las verificaciones esenciales de seguridad para blindar la aplicación frente a amenazas habituales (OWASP Top 10) tanto en la API en .NET 9 como en la aplicación cliente en React.

---

## 1. Seguridad en la Capa de Datos (EF Core & MySQL)

- **Prevención de Inyección SQL**:
  - Utilizar siempre LINQ tipado o consultas parametrizadas de Entity Framework Core.
  - ❌ **Prohibido**: Concatenar cadenas directamente dentro de `FromSqlRaw` o comandos ADO.NET.
- **Principio de Mínimo Privilegio**:
  - El usuario de base de datos (`chef`) debe limitarse a las tablas de la aplicación `chefcopilot`.

---

## 2. Protección de Entradas y Salidas de la API

- **Validación Estricta de Entradas (Whitelist)**:
  - Ningún comando debe llegar a la base de datos sin pasar por su validador de **FluentValidation**.
  - Comprobar límites de longitud (`MaximumLength`), rangos numéricos positivos y campos requeridos para evitar saturación de memoria o desbordamientos (*Buffer/Resource Exhaustion*).
- **Prevención de Fuga de Información (*Data Leakage*)**:
  - **Uso estricto de DTOs**: Las entidades de base de datos nunca se devuelven en crudo.
  - En entorno de producción, `ExceptionHandlingMiddleware` solo debe devolver mensajes genéricos de error y códigos RFC 7807 sin exponer volcados de memoria (*stack traces*) ni detalles del servidor de base de datos.

---

## 3. Gestión de Secretos y Configuración

- **Credenciales y Tokens**:
  - Las contraseñas de bases de datos y tokens de servicios externos (ej. Figma API Key) no deben commitearse en texto plano en repositorios públicos.
  - Utilizar `dotnet user-secrets` en desarrollo local y variables de entorno (`ASPNETCORE_` / `FIGMA_API_KEY`) en entornos de despliegue.

---

## 4. Auditoría de Dependencias

Ejecutar periódicamente las herramientas de detección de vulnerabilidades:
```powershell
# En backend
dotnet list package --vulnerable

# En frontend
npm audit --prefix frontend
```
Resolver cualquier aviso de severidad alta actualizando paquetes a versiones seguras.
