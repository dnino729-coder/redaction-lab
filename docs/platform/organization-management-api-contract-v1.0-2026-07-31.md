# ORGANIZATION MANAGEMENT — API CONTRACT v1.0

**Fecha:** 2026-07-31
**Autor:** API Architect, Rédaction Lab
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001; Organization Management Scope v1.0; Organization Management Functional Specification v1.0; Organization Management Ubiquitous Language v1.0; Organization Management Domain Model v1.1; Organization Management Application Model v1.1; Organization Management Infrastructure Model v1.1; Academia API Contract v1.4 (releído solo como referencia de estilo); Platform Core Foundation; Project Structure Specification.
**Alcance:** contrato público del Bounded Context exclusivamente. Sin implementación, sin infraestructura, sin base de datos, sin UI.

**Correspondencia exacta exigida — verificada antes de diseñar:** Application Model v1.1 define **3 Commands** (`RegisterOrganization`, `AddMembership`, `RemoveMembership`) y **2 Queries** (`VerifyAuthority`, `EnumerateAuthority`). Este documento define **exactamente 5 endpoints**, uno por cada uno — ninguno adicional.

---

## Endpoints

### `POST /api/v1/organizations`
- **Traza a:** Command `RegisterOrganization` → `RegisterOrganizationHandler`.
- **Por qué existe:** único punto de entrada para UC-OM-01 (Functional Specification v1.0).

### `POST /api/v1/memberships`
- **Traza a:** Command `AddMembership` → `AddMembershipHandler`.
- **Por qué existe:** único punto de entrada para UC-OM-02+UC-OM-04. **Dirección de diseño explícita:** no se anida bajo `/organizations/{organizationId}/memberships` — `Membership` es, desde el Domain Model v1.1 (corrección de C-01), un Aggregate Root con identidad propia, independiente de `Organization`; anidarlo bajo la ruta de `Organization` reintroduciría, a nivel de API, el acoplamiento que esa corrección eliminó a nivel de dominio. `organizationId` viaja en el cuerpo de la solicitud, no en la ruta.

### `DELETE /api/v1/memberships/{membershipId}`
- **Traza a:** Command `RemoveMembership` → `RemoveMembershipHandler`.
- **Por qué existe:** único punto de entrada para UC-OM-03. Dirección coherente con la anterior — `membershipId` es suficiente por sí solo, sin necesitar el `organizationId` en la ruta.

### `GET /api/v1/authority`
- **Traza a:** Query `VerifyAuthority` → `VerifyAuthorityHandler`.
- **Por qué existe:** único punto de entrada para UC-OM-05 — único consumidor evidenciado: Academia.
- **Parámetros de consulta:** `memberId`, `role`, `targetMemberId` — exactamente los tres datos ya definidos en Application Model v1.1 §3, ninguno adicional.

### `GET /api/v1/authority/members`
- **Traza a:** Query `EnumerateAuthority` → `EnumerateAuthorityHandler`.
- **Por qué existe:** único punto de entrada para UC-OM-06.
- **Parámetros de consulta:** `memberId`, `role` — exactamente los dos ya definidos, sin paginación (ver Riesgos abiertos — ya señalada como pendiente por Infrastructure Model v1.1, no resuelta aquí), sin filtros, sin ordenamiento, sin búsqueda adicionales.

**No se diseña ningún endpoint adicional** (sin `GET /organizations`, sin `GET /organizations/{id}`, sin `GET /memberships`) — ninguno tiene un consumidor evidenciado por ningún documento anterior.

---

## Request DTO

### `POST /api/v1/organizations`
**NO DOCUMENTADO.** Ningún documento anterior (Domain Model v1.1 §6, Application Model v1.1) define los campos de la "identidad mínima" de una `Organization` más allá de su necesidad de existir. Este API Contract **no inventa campos** (p. ej. `name`, `displayName`) sin respaldo documental — se declara explícitamente que el Request DTO de este endpoint permanece **incompleto** hasta que ese vacío se resuelva en una futura extensión del Domain Model/Application Model. Esta es una limitación real de este documento, señalada en Riesgos abiertos, no una omisión silenciosa.

### `POST /api/v1/memberships`
| Campo | Origen |
|---|---|
| `organizationId` | Application Model v1.1 §2 (`AddMembership`). |
| `memberId` | Ídem. |
| `role` | Ídem — la etiqueta de `Role`, tal como la especifica el llamador (Application Model v1.1 §3, nota sobre `VerifyAuthority`). |

**Ningún campo adicional** (sin metadata, sin campos de auditoría expuestos al cliente).

### `DELETE /api/v1/memberships/{membershipId}`
Ningún campo de cuerpo — `membershipId` viaja en la ruta.

### `GET /api/v1/authority`
| Parámetro | Origen |
|---|---|
| `memberId` | Application Model v1.1 §3 (`VerifyAuthority`). |
| `role` | Ídem. |
| `targetMemberId` | Ídem. |

### `GET /api/v1/authority/members`
| Parámetro | Origen |
|---|---|
| `memberId` | Application Model v1.1 §3 (`EnumerateAuthority`). |
| `role` | Ídem. |

---

## Response DTO

**Principio aplicado en los cinco:** nunca se devuelve un Aggregate completo ni su estructura interna — solo los campos de identidad/valor ya evidenciados como parte pública de cada Command/Query.

### `POST /api/v1/organizations` → `201 Created`
`{ organizationId }` — único dato evidenciado (la identidad recién creada, Domain Model v1.1 §4).

### `POST /api/v1/memberships` → `201 Created`
`{ membershipId, organizationId, memberId, role }` — exactamente los atributos públicos de `Membership` ya definidos en Domain Model v1.1 §4/§6, nada más (sin exponer, p. ej., el estado interno de lifecycle más allá de que la creación fue exitosa).

### `DELETE /api/v1/memberships/{membershipId}` → `204 No Content`
Sin cuerpo — consistente con la semántica ya usada en el proyecto para operaciones que confirman una transición de estado sin necesidad de devolver datos.

### `GET /api/v1/authority` → `200 OK`
`{ authorized: boolean }` — exactamente el dato devuelto por `VerifyAuthority` (Application Model v1.1 §3), sin exponer qué `Membership` concreta produjo el resultado.

### `GET /api/v1/authority/members` → `200 OK`
`{ memberIds: string[] }` — exactamente el dato devuelto por `EnumerateAuthority`, sin exponer ninguna `Membership` ni `Role` de los miembros enumerados.

---

## Errores

*(Solo los evidenciados por Application Model v1.1 §9 — ninguno inventado.)*

| Endpoint | 400 | 401 | 403 | 404 | 409 | 422 | 500 |
|---|---|---|---|---|---|---|---|
| `POST /organizations` | Sí — solicitud mal formada. | Sí — sesión inválida (mecanismo de plataforma ya vigente, Permission Catalog). | Conceptualmente sí — actor sin capacidad administrativa; **mecanismo exacto NO DOCUMENTADO** (Application Model v1.1 §7). | No aplica — es una creación. | No aplica — ningún documento define una regla de unicidad para `Organization`. | No aplica — sin evidencia de una distinción semántica separada de 400. | Sí. |
| `POST /memberships` | Sí — `role` ausente, identificadores mal formados. | Sí. | Conceptualmente sí — mismo NO DOCUMENTADO. | Sí — `Organization` referenciada inexistente (Invariante 3). | **Sí** — segunda `Membership` activa para el mismo par `(Organization, Member)` (Invariante 2, Application Model v1.1 §9). | No aplica. | Sí. |
| `DELETE /memberships/{id}` | Sí — `membershipId` mal formado. | Sí. | Conceptualmente sí — mismo NO DOCUMENTADO. | Sí — `Membership` inexistente. | No aplica — ningún documento define un conflicto para el retiro (la política de `Authority` tras retiro permanece sin definir, Application Model v1.1/Infrastructure Model v1.1; no se inventa un código de error para una regla inexistente). | No aplica. | Sí. |
| `GET /authority` | Sí — parámetros ausentes/mal formados. | **No aplica** — Application Model v1.1 §7 ya estableció que esta Query no requiere autorización propia; el mecanismo de autenticación servicio-a-servicio entre Bounded Contexts, si existiera, **NO DOCUMENTADO**. | **No aplica**, mismo motivo. | **No aplica** — `MemberId` es una referencia opaca nunca verificada contra Perfil (Domain Model v1.1 §14); la ausencia de `Membership` produce `authorized: false`, no un 404. | No aplica — solo lectura. | No aplica. | Sí. |
| `GET /authority/members` | Sí — parámetros ausentes/mal formados. | No aplica, mismo motivo. | No aplica, mismo motivo. | No aplica, mismo motivo — una colección vacía, no un 404. | No aplica. | No aplica. | Sí. |

---

## Versionado

**Estrategia:** prefijo de versión en la URI (`/api/v1/...`) — misma convención ya usada por Academia (API Contract v1.4). **Compatibilidad:** cambios aditivos (campos nuevos opcionales, endpoints nuevos) no requieren nueva versión mayor; cualquier cambio incompatible (renombrar/eliminar un campo, cambiar el significado de un código de error) exige una nueva versión mayor — mismo criterio ya aplicado por Academia a lo largo de sus revisiones v1.0→v1.4 (siempre aditivas, sin renumeración disruptiva). **Evolución:** no se diseña ningún mecanismo técnico de negociación de versión (headers, content negotiation) — fuera de alcance de este documento.

---

## Idempotencia

**Indicada únicamente donde existe evidencia:**
- `GET /authority`, `GET /authority/members`: idempotentes por naturaleza (operaciones de solo lectura, sin efecto secundario).
- `DELETE /memberships/{membershipId}`: semánticamente idempotente por convención HTTP estándar — repetir la solicitud sobre una `Membership` ya Removida no tiene un comportamiento documentado explícito (¿`204` de nuevo, o `404`?) — **NO DOCUMENTADO**, no se asume una respuesta.
- `POST /organizations`, `POST /memberships`: **sin mecanismo de idempotencia documentado.** A diferencia de Academia (que exige `Idempotency-Key` para `CMD-10`/`CMD-11`, Application Layer Specification v1.0), **ningún documento de Organization Management** menciona un mecanismo equivalente — no se asume por analogía con Academia; se declara ausente.

---

## Authorization

**Misma posición documental exacta que Application Model v1.1 §7 — sin reinterpretarla:**

| Endpoint | ¿Requiere autorización? | Estado |
|---|---|---|
| `POST /organizations` | Conceptualmente sí | **NO DOCUMENTADO** el mecanismo exacto. |
| `POST /memberships`, `DELETE /memberships/{id}` | Conceptualmente sí | **Mismo NO DOCUMENTADO.** |
| `GET /authority`, `GET /authority/members` | No requieren autorización propia | Ya establecido así en Application Model v1.1 §7 — son ellas mismas el mecanismo que Academia usa para su propia autorización. |

---

## Compatibilidad

| Documento | ¿Contradicción? |
|---|---|
| Product Architecture v1.0 | Ninguna. |
| Organization Strategy v1.0 | Ninguna. |
| ADR-001 | Ninguna — ningún endpoint nombra vocabulario sectorial. |
| Scope v1.0 | Ninguna — 5 endpoints, exactamente las 5 capacidades ya congeladas. |
| Functional Specification v1.0 | Ninguna — cada endpoint traza a un UC-OM ya existente. |
| Ubiquitous Language v1.0 | Ninguna — ningún término nuevo (`Organization`, `Member`, `Membership`, `Role`, `Authority`, ya congelados). |
| Domain Model v1.1 | Ninguna — ningún Aggregate/Value Object expuesto más allá de su representación pública ya definida. |
| Application Model v1.1 | Ninguna — 3 Commands + 2 Queries, sin adición. |
| Infrastructure Model v1.1 | Ninguna — el riesgo abierto de paginación en `findByOrganizationId` (subyacente a `GET /authority/members`) se hereda explícitamente, no se resuelve aquí. |
| Academia API Contract v1.4 | Ninguna — mismo estilo de versionado (`/api/v1/...`), sin acoplamiento de vocabulario. |

---

## Auditoría obligatoria

1. **¿Exactamente un endpoint por cada Command y Query?** Sí — 5 endpoints, 5 Command/Query, correspondencia 1:1 verificada.
2. **¿Algún endpoint sin consumidor?** No — los 3 Commands tienen como actor al "actor con capacidad administrativa" (Functional Specification v1.0 §3); las 2 Queries tienen a Academia como consumidor evidenciado.
3. **¿Algún DTO con atributos no respaldados?** No — el único DTO potencialmente incompleto (`POST /organizations`) se declara explícitamente NO DOCUMENTADO en vez de inventar atributos.
4. **¿Algún error inventado?** No — cada código de error cita su origen en Application Model v1.1 §9 o se declara explícitamente "no aplica" con justificación.
5. **¿Se introdujo alguna capacidad nueva?** No.
6. **¿Contradicción con documentos anteriores?** No, verificado en la tabla de Compatibilidad.
7. **¿Se mantuvo completamente genérico el lenguaje?** Sí — ningún endpoint, parámetro ni campo usa vocabulario de Academia.
8. **¿Acoplamiento con Academia?** Ninguno — Academia aparece únicamente como consumidor evidenciado de las 2 Queries, nunca como dependencia de diseño.
9. **¿Algún endpoint expone información interna del dominio?** No — ningún Response DTO expone un Aggregate completo ni su estructura interna.
10. **¿Se diseñó accidentalmente infraestructura o implementación?** No — sin Controllers, Framework, implementación REST concreta, GraphQL, OpenAPI/Swagger, base de datos, ORM, SQL, eventos nuevos, Commands/Queries nuevos, Repositories, Aggregates, Value Objects, integraciones nuevas, seguridad, OAuth, JWT, Clerk, multi-tenancy técnico, paginación no documentada, filtros, sorting, search, batch ni bulk.

---

## Informe obligatorio

### 1. Archivo creado
`docs/platform/organization-management-api-contract-v1.0-2026-07-31.md`

### 2. Endpoints definidos
`POST /api/v1/organizations`; `POST /api/v1/memberships`; `DELETE /api/v1/memberships/{membershipId}`; `GET /api/v1/authority`; `GET /api/v1/authority/members` — 5 en total, correspondencia 1:1 con los 3 Commands y 2 Queries de Application Model v1.1.

### 3. DTOs definidos
Request: `POST /organizations` (NO DOCUMENTADO, declarado explícitamente); `POST /memberships` (`organizationId`, `memberId`, `role`); `GET /authority` (`memberId`, `role`, `targetMemberId`); `GET /authority/members` (`memberId`, `role`). Response: cinco DTOs, cada uno limitado a los atributos públicos ya evidenciados, sin exponer ningún Aggregate completo.

### 4. Estrategia de versionado
Prefijo de URI (`/api/v1/...`), misma convención que Academia; cambios aditivos sin nueva versión mayor, cambios incompatibles con nueva versión mayor; sin mecanismo técnico de negociación diseñado.

### 5. Compatibilidad documental
Sin contradicciones con ninguno de los 10 documentos verificados (tabla de Compatibilidad).

### 6. Riesgos abiertos
- El Request/Response DTO de `POST /organizations` permanece incompleto — la "identidad mínima" de `Organization` nunca fue especificada por ningún documento anterior; este API Contract no la inventa.
- `GET /authority/members` hereda, sin resolver, el riesgo de volumen no acotado ya reconocido en Infrastructure Model v1.1 (`findByOrganizationId`) — sin paginación diseñada.
- El mecanismo exacto de autorización (401/403) para los 3 Commands permanece NO DOCUMENTADO — heredado sin resolver de Application Model v1.1 §7.
- La política de `Authority` tras retirar una `Membership` permanece sin definir — sin código de error inventado para ella.
- Ausencia de mecanismo de idempotencia para `POST /organizations`/`POST /memberships`, a diferencia del patrón ya usado por Academia — declarada, no asumida.

### 7. Dictamen final

**Organization Management — API Contract v1.0 completo, con los riesgos abiertos arriba explícitamente declarados y heredados de documentos anteriores — ninguno inventado ni resuelto por este documento.**

Detenido. No se avanza a implementación, código ni auditoría.
