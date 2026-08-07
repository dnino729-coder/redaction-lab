# ORGANIZATION MANAGEMENT — API CONTRACT v1.2

**Fecha:** 2026-07-31
**Autor:** API Architect, Rédaction Lab
**Versión anterior:** v1.1 (2026-07-31, conservada sin modificar por trazabilidad histórica — `organization-management-api-contract-v1.1-2026-07-31.md`), corregida en respuesta a `organization-management-api-contract-v1.1-audit-2026-07-31` (hallazgo importante I-01, dictamen: B, aprobado con observaciones).
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001; Organization Management Scope v1.0; Organization Management Functional Specification v1.0; Organization Management Ubiquitous Language v1.0; Organization Management Domain Model v1.1; Organization Management Application Model v1.1; Organization Management Infrastructure Model v1.1; Organization Management Organization Identity Specification v1.0; Academia API Contract v1.4 (referencia de estilo).
**Alcance de esta revisión:** corrige exclusivamente la explicación del código `400` de `POST /api/v1/organizations` (hallazgo I-01). **Ningún endpoint, DTO, Command, Query, código HTTP existente (como código), versionado ni idempotencia cambia.** Siguen existiendo exactamente 5 endpoints, 3 Commands y 2 Queries.

---

## Endpoints

*(Idénticos a v1.1, sin cambio alguno.)*

### `POST /api/v1/organizations` → `RegisterOrganization` → `RegisterOrganizationHandler`
### `POST /api/v1/memberships` → `AddMembership` → `AddMembershipHandler`
### `DELETE /api/v1/memberships/{membershipId}` → `RemoveMembership` → `RemoveMembershipHandler`
### `GET /api/v1/authority` → `VerifyAuthority` → `VerifyAuthorityHandler`
### `GET /api/v1/authority/members` → `EnumerateAuthority` → `EnumerateAuthorityHandler`

**Confirmado: siguen siendo exactamente 5 endpoints — 3 Commands, 2 Queries.**

---

## Request DTO

*(Sin cambios respecto a v1.1.)* `POST /api/v1/organizations`: Request Body vacío, confirmado por Domain Model v1.1 §4 y Organization Identity Specification v1.0. Los otros cuatro DTO permanecen exactamente iguales.

---

## Response DTO

*(Sin cambios respecto a v1.1.)*

---

## Errores

**Corrección I-01 — análisis exclusivo del `400` de `POST /api/v1/organizations`:**

**Pregunta a responder con evidencia:** ¿qué representa concretamente un `400` para un endpoint cuyo Request Body es vacío?

**Búsqueda de evidencia realizada:** ningún documento de esta cadena (Domain Model v1.1, Application Model v1.1, Infrastructure Model v1.1, Organization Identity Specification v1.0, API Contract v1.0/v1.1) ni el documento de referencia de Academia (API Contract v1.4) especifica qué constituye, a nivel de transporte, una "solicitud mal formada" para un endpoint sin campos de entrada — ninguno describe validación de headers, de `Content-Type`, de cuerpos inesperados, ni ningún otro escenario de error de transporte para este caso específico.

**Conclusión, sin inventar un escenario:** el comportamiento exacto de `400` para `POST /api/v1/organizations` es **NO DOCUMENTADO**. Se conserva la categoría `400` en la tabla (no se retira, tal como exige el encargo), pero su explicación se corrige de "solicitud mal formada" (v1.1, que asumía implícitamente un escenario no respaldado) a una declaración explícita de vacío documental — no se define aquí qué la dispararía.

### Tabla de errores (heredada de v1.0/v1.1, con la única celda corregida)

| Endpoint | 400 | 401 | 403 | 404 | 409 | 422 | 500 |
|---|---|---|---|---|---|---|---|
| `POST /organizations` | **Categoría conservada; disparador NO DOCUMENTADO para un Request Body vacío — no se inventa un escenario (corrección I-01).** | Sí — sesión inválida (mecanismo de plataforma ya vigente). | Conceptualmente sí — mecanismo exacto NO DOCUMENTADO. | No aplica. | No aplica. | No aplica. | Sí. |
| `POST /memberships` | Sí — `role` ausente, identificadores mal formados. | Sí. | Conceptualmente sí — mismo NO DOCUMENTADO. | Sí — `Organization` inexistente. | Sí — segunda `Membership` activa para el mismo par. | No aplica. | Sí. |
| `DELETE /memberships/{id}` | Sí — `membershipId` mal formado. | Sí. | Conceptualmente sí — mismo NO DOCUMENTADO. | Sí — `Membership` inexistente. | No aplica. | No aplica. | Sí. |
| `GET /authority` | Sí — parámetros ausentes/mal formados. | No aplica. | No aplica. | No aplica — produce `authorized: false`. | No aplica. | No aplica. | Sí. |
| `GET /authority/members` | Sí — parámetros ausentes/mal formados. | No aplica. | No aplica. | No aplica. | No aplica. | No aplica. | Sí. |

**Ninguna otra celda cambia respecto a v1.0/v1.1** — verificado explícitamente, fila por fila.

---

## Versionado

*(Sin cambios.)*

## Idempotencia

*(Sin cambios.)*

## Authorization

*(Sin cambios.)*

---

## Compatibilidad

| Documento | ¿Contradicción? |
|---|---|
| Product Architecture v1.0 | Ninguna. |
| Organization Strategy v1.0 | Ninguna. |
| ADR-001 | Ninguna. |
| Scope v1.0 | Ninguna. |
| Functional Specification v1.0 | Ninguna. |
| Ubiquitous Language v1.0 | Ninguna. |
| Domain Model v1.1 | Ninguna. |
| Application Model v1.1 | Ninguna. |
| Infrastructure Model v1.1 | Ninguna. |
| Organization Identity Specification v1.0 | Ninguna. |
| API Contract v1.1 | Ninguna — esta revisión es una precisión de explicación, no una redefinición del código `400` como tal. |
| Academia API Contract v1.4 | Ninguna. |

---

## Informe obligatorio

### 1. Archivo creado
`docs/platform/organization-management-api-contract-v1.2-2026-07-31.md`. El v1.1 se conserva sin modificar.

### 2. Cambio realizado
Se corrigió, exclusivamente, la explicación del código `400` de `POST /api/v1/organizations`: de "solicitud mal formada" (v1.1, que asumía un escenario sin respaldo documental) a una declaración explícita de que su disparador concreto, para un endpoint con Request Body vacío, es **NO DOCUMENTADO** — sin inventar ningún escenario. El código `400` en sí se conserva en la tabla, no se retira.

### 3. Cambios descartados
No se inventó ningún escenario de validación de transporte (headers, `Content-Type`, cuerpo inesperado) para justificar el `400`. No se modificó ningún otro endpoint, DTO, código HTTP, Command, Query, versionado ni idempotencia. No se diseñó autenticación, autorización ni infraestructura.

### 4. Compatibilidad documental
Sin contradicciones con ninguno de los 12 documentos verificados.

### 5. Dictamen final

**Organization Management — API Contract v1.2 completo. Hallazgo I-01 corregido mediante declaración explícita de comportamiento no especificado, sin inventar escenarios. Ningún otro aspecto del contrato se modificó.**

Detenido. No se continúa con ningún documento posterior.
