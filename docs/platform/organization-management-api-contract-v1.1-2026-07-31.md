# ORGANIZATION MANAGEMENT — API CONTRACT v1.1

**Fecha:** 2026-07-31
**Autor:** API Architect, Rédaction Lab
**Versión anterior:** v1.0 (2026-07-31, conservada sin modificar por trazabilidad histórica — `organization-management-api-contract-v1.0-2026-07-31.md`), actualizada exclusivamente en respuesta a `organization-management-organization-identity-specification-v1.0-2026-07-31.md` (y a su auditoría independiente).
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001; Organization Management Scope v1.0; Organization Management Functional Specification v1.0; Organization Management Ubiquitous Language v1.0; Organization Management Domain Model v1.1; Organization Management Application Model v1.1; Organization Management Infrastructure Model v1.1; Organization Management Organization Identity Specification v1.0; Academia API Contract v1.4 (releído solo como referencia de estilo).
**Alcance de esta revisión:** actualiza exclusivamente el Request DTO de `POST /api/v1/organizations`, ya cerrado por evidencia en Organization Identity Specification v1.0. **Ningún endpoint, Command, Query, ruta, código HTTP ni versionado cambia.** Siguen existiendo exactamente 5 endpoints, 3 Commands y 2 Queries.

---

## Endpoints

*(Idénticos a v1.0, sin cambio alguno — verificado explícitamente contra el documento anterior.)*

### `POST /api/v1/organizations`
- **Traza a:** Command `RegisterOrganization` → `RegisterOrganizationHandler`.
- **Por qué existe:** único punto de entrada para UC-OM-01.

### `POST /api/v1/memberships`
- **Traza a:** Command `AddMembership` → `AddMembershipHandler`.
- **Sin cambio.**

### `DELETE /api/v1/memberships/{membershipId}`
- **Traza a:** Command `RemoveMembership` → `RemoveMembershipHandler`.
- **Sin cambio.**

### `GET /api/v1/authority`
- **Traza a:** Query `VerifyAuthority` → `VerifyAuthorityHandler`.
- **Sin cambio.**

### `GET /api/v1/authority/members`
- **Traza a:** Query `EnumerateAuthority` → `EnumerateAuthorityHandler`.
- **Sin cambio.**

**Confirmado: siguen siendo exactamente 5 endpoints — 3 Commands, 2 Queries — ninguno nuevo, ninguno retirado.**

---

## Request DTO

### `POST /api/v1/organizations` — **único cambio de esta revisión**

**v1.0:** declarado NO DOCUMENTADO / incompleto.

**v1.1 — resuelto por evidencia (Organization Identity Specification v1.0, Secciones 1-2):**

**El Request Body de este endpoint es vacío.**

**Justificación, sin asumir nada más allá de lo evidenciado:**
- Domain Model v1.1 §4 declara, sobre `Organization`: *"poseer su propia identidad. Nada más en esta versión — sin `Membership` interna."* — no hay ningún atributo adicional que un cliente pudiera o debiera suministrar.
- Application Model v1.1 §4 (`RegisterOrganizationHandler`) ya establece que la identidad se genera mediante `UuidGenerator` — **del lado del servidor**, nunca suministrada por el cliente.
- Organization Identity Specification v1.0 (Secciones 2 y 10) confirma, con esta misma evidencia, que ningún atributo —ni siquiera un nombre legible— está respaldado como obligatorio u opcional por ningún documento.

**No se declara ningún campo.** No se agrega `name`, no se agrega ningún campo opcional, no se agrega metadata — consistente con la instrucción explícita de no rellenar un DTO vacío con atributos no evidenciados.

### `POST /api/v1/memberships`, `DELETE /api/v1/memberships/{membershipId}`, `GET /api/v1/authority`, `GET /api/v1/authority/members`

**Sin cambios respecto a v1.0.** Ninguno de estos cuatro DTO depende, directa ni indirectamente, de qué atributos adicionales pudiera tener `Organization` — `POST /memberships` solo requiere `organizationId` como **referencia** (un identificador, no el objeto `Organization` completo), sin importar qué otros atributos esa `Organization` tenga o no tenga. Verificado explícitamente: **no existe ningún otro DTO en este contrato que dependa de la decisión de Organization Identity Specification v1.0.**

---

## Response DTO

*(Sin cambios respecto a v1.0.)* `POST /organizations` ya devolvía, desde v1.0, únicamente `{ organizationId }` — la nueva evidencia sobre el Request Body no afecta el Response DTO, que ya era mínimo y ya era correcto. Los otros cuatro Response DTO permanecen idénticos.

---

## Errores

*(Sin cambios respecto a v1.0 — verificado explícitamente.)* La tabla de errores por endpoint de v1.0 permanece exactamente igual. El Request Body vacío de `POST /organizations` no introduce ningún error nuevo (un cuerpo vacío es, por definición, siempre sintácticamente válido para este endpoint — el `400` documentado en v1.0 seguía existiendo para el caso general de solicitud mal formada a nivel de transporte, no se retira ni se redefine).

---

## Versionado

*(Sin cambios respecto a v1.0.)*

---

## Idempotencia

*(Sin cambios respecto a v1.0.)* `POST /organizations` sigue sin mecanismo de idempotencia documentado — un cuerpo vacío no altera esta conclusión: sin `Idempotency-Key`, cada invocación seguiría creando una `Organization` nueva, exactamente igual que antes.

---

## Authorization

*(Sin cambios respecto a v1.0 — no se diseña autenticación ni autorización en este documento, tal como exige la restricción.)*

---

## Compatibilidad

| Documento | ¿Contradicción? |
|---|---|
| Product Architecture v1.0 | Ninguna. |
| Organization Strategy v1.0 | Ninguna. |
| ADR-001 | Ninguna. |
| Scope v1.0 | Ninguna. |
| Functional Specification v1.0 | Ninguna. |
| Ubiquitous Language v1.0 | Ninguna — sin término nuevo. |
| Domain Model v1.1 | Ninguna — el Request Body vacío es consecuencia directa de su propio §4 ("nada más en esta versión"). |
| Application Model v1.1 | Ninguna — consistente con el uso ya documentado de `UuidGenerator`. |
| Infrastructure Model v1.1 | Ninguna. |
| Organization Identity Specification v1.0 | Ninguna — este documento es, precisamente, la aplicación directa de su conclusión. |
| Academia API Contract v1.4 | Ninguna — mismo estilo. |

---

## Informe obligatorio

### 1. Archivos creados
`docs/platform/organization-management-api-contract-v1.1-2026-07-31.md`. El v1.0 se conserva sin modificar.

### 2. Cambios realizados respecto a v1.0
**Único cambio:** el Request DTO de `POST /api/v1/organizations` pasa de "NO DOCUMENTADO / incompleto" a **"vacío, confirmado por evidencia"** (Domain Model v1.1 §4 + Application Model v1.1 §4 + Organization Identity Specification v1.0). Ningún endpoint, Command, Query, ruta, Response DTO, código de error, versionado ni idempotencia cambia.

### 3. Riesgos cerrados
El riesgo abierto de v1.0 *"el Request/Response DTO de `POST /organizations` permanece incompleto"* **queda cerrado**: el Request DTO ya no está incompleto — está definido como vacío, con justificación documental completa, sin ningún atributo inventado.

### 4. Riesgos que permanecen abiertos
*(Ninguno de estos depende de la decisión de esta revisión — permanecen exactamente como en v1.0):*
- `GET /authority/members` hereda, sin resolver, el riesgo de volumen no acotado de Infrastructure Model v1.1 (`findByOrganizationId`) — sin paginación diseñada.
- El mecanismo exacto de autorización (401/403) para los 3 Commands permanece NO DOCUMENTADO.
- La política de `Authority` tras retirar una `Membership` permanece sin definir.
- Ausencia de mecanismo de idempotencia para `POST /organizations`/`POST /memberships` — un cuerpo vacío no lo resuelve ni lo agrava.
- Si en el futuro se decide que `Organization` necesita un atributo legible (nombre), ese cambio exigirá una nueva revisión de este API Contract — no anticipado aquí (Organization Identity Specification v1.0, Sección "Decisiones deliberadamente NO tomadas").

### 5. Compatibilidad documental
Sin contradicciones con ninguno de los 11 documentos verificados (tabla de Compatibilidad).

### 6. Dictamen

**Organization Management — API Contract v1.1 completo. Un riesgo cerrado (Request DTO de `POST /organizations`); cinco riesgos heredados permanecen abiertos, sin cambio.**

Detenido. No se avanza a implementación, código ni auditoría.
