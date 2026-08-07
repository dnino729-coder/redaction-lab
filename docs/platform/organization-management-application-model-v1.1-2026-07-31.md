# ORGANIZATION MANAGEMENT — APPLICATION MODEL v1.1

**Fecha:** 2026-07-31
**Autor:** Software Architect, Rédaction Lab
**Versión anterior:** v1.0 (2026-07-31, conservada sin modificar por trazabilidad histórica — `organization-management-application-model-v1.0-2026-07-31.md`), corregida en respuesta a `organization-management-application-model-audit-v1.0-2026-07-31.md` (dictamen: B, aprobado con observaciones).
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001; Organization Management Scope v1.0; Organization Management Functional Specification v1.0; Organization Management Ubiquitous Language v1.0; Organization Management Domain Model v1.1; Organization Management Domain Model Audit v1.1; Application Model v1.5, Domain Model v1.1, Infrastructure Model v1.2, API Contract v1.4, Functional Specification v1.3, Blueprint v1.1.1 (todos de Academia); ACP-001 a ACP-004.
**Alcance de esta revisión:** responde exclusivamente a las observaciones H-01 y H-02 de la auditoría v1.0 — ningún Command, Query, Repository, Role ni concepto nuevo; ningún rediseño ni ampliación de alcance.

---

## 1. Casos de Uso — trazabilidad exclusiva desde Functional Specification v1.0

*(Sin cambios respecto a v1.0 — no es consecuencia de H-01/H-02.)*

| Caso de uso (Functional Specification v1.0) | ¿Genera Command/Query en este documento? |
|---|---|
| UC-OM-01 — Registrar una Organización | Sí — Command `RegisterOrganization`. |
| UC-OM-02 — Asociar un Miembro a una Organización | Sí, **combinado con UC-OM-04** (ver justificación abajo) — Command `AddMembership`. |
| UC-OM-03 — Retirar la Pertenencia de un Miembro | Sí — Command `RemoveMembership`. |
| UC-OM-04 — Asignar un Rol organizacional a un Miembro | Sí, combinado con UC-OM-02 (ver abajo). |
| UC-OM-05 — Verificar autoridad | Sí — Query `VerifyAuthority`. |
| UC-OM-06 — Enumerar Miembros bajo autoridad | Sí — Query `EnumerateAuthority`. |
| UC-OM-07 a UC-OM-10 (= CU-09 a CU-12 de Academia) | **No** — son casos de uso ya propios de Academia; no se diseña ningún Command/Query de Organization Management para ellos, solo se consumen los resultados de `VerifyAuthority`/`EnumerateAuthority` (Sección 2 de la Functional Specification v1.0). |
| UC-OM-11 — Gestionar Membresía y Roles | No genera un Command propio — es la descripción administrativa de invocar UC-OM-02/03/04, ya cubiertos arriba. |

**Justificación de combinar UC-OM-02 y UC-OM-04 en un único Command:** el Domain Model v1.1 (Sección 4) define `Membership` con `Role` como atributo obligatorio desde su creación — no existe, en ningún Aggregate ni invariante ya congelado, un estado intermedio de "Membership sin Rol". La Functional Specification v1.0 nunca describe una operación separada de "cambiar" el Rol después de asignado (solo "asignar", UC-OM-04) — en consecuencia, un único Command que cree la `Membership` con su `Role` ya definido es la única lectura consistente con el Aggregate ya Frozen, sin inventar un estado intermedio no evidenciado.

**No se genera ningún Command/Query adicional** — verificado de nuevo en esta revisión contra Scope v1.0 (§4, "nada más"): **siguen siendo exactamente 3 Commands y 2 Queries**, ninguno añadido ni retirado.

---

## 2. Commands

### `RegisterOrganization`
*(Sin cambios respecto a v1.0.)*
- **Propósito:** registrar la existencia de una nueva `Organization` (UC-OM-01).
- **Actor:** actor con capacidad administrativa (Functional Specification v1.0 §3) — mecanismo exacto de autorización **NO DOCUMENTADO** (Sección 7).
- **Aggregate(s) involucrado(s):** `Organization` (creación).
- **Repository requerido:** `OrganizationRepository` (`save`).
- **Resultado esperado:** la `Organization` queda registrada; se emite `OrganizationRegistered`.

### `AddMembership`
*(Sin cambios de fondo respecto a v1.0 — la precisión de su garantía transaccional se documenta en la Sección 8, corrección A-01.)*
- **Propósito:** asociar un `Member` a una `Organization` ya registrada, con un `Role` (UC-OM-02 + UC-OM-04).
- **Actor:** actor con capacidad administrativa — mismo NO DOCUMENTADO que arriba.
- **Aggregate(s) involucrado(s):** `Membership` (creación); `Organization` (solo lectura, para verificar su existencia — Invariante 3 del Domain Model v1.1).
- **Repository requerido:** `OrganizationRepository` (`findById`, verificación de existencia); `MembershipRepository` (`findByMemberId`, verificación del Invariante 2; `save`, creación).
- **Resultado esperado:** la `Membership` queda creada, con exactamente un `Role`; se emite `MemberAdded`.

### `RemoveMembership`
- **Propósito:** retirar una `Membership` existente (UC-OM-03).
- **Actor:** actor con capacidad administrativa — mismo NO DOCUMENTADO.
- **Aggregate(s) involucrado(s):** `Membership` (transición de estado a Removida — Domain Model v1.1 §12, lifecycle).
- **Repository requerido:** `MembershipRepository` (`findById`, `save` — nunca una eliminación física, consistente con el principio ya vigente en todo el proyecto de "nunca eliminar información sin migración previa", ya aplicado idénticamente en Mi Plan y en `ModelExample` de Academia).
- **Resultado esperado:** la `Membership` queda en estado Removida; se emite `MemberRemoved`.
- **Corrección A-01.1 — Vacío documentado explícitamente, no resuelto (consecuencia directa de la observación H-02 de la auditoría v1.0):** este Command **no define** qué ocurre con la `Authority` que la `Membership` retirada otorgaba sobre (o desde) otros `Member`. Ese comportamiento dependerá de una **política de `Authority`** (p. ej., si la autoridad ejercida hasta el momento del retiro debe revocarse de inmediato, mantenerse hasta una acción explícita adicional, o quedar sujeta a alguna otra regla) que **todavía no forma parte del alcance de Organization Management v1.1** — ningún documento anterior (Functional Specification v1.0, Scope v1.0, Domain Model v1.1) la define. Este documento no inventa esa política ni asume un comportamiento por defecto; se deja explícitamente como dependencia futura, no resuelta.

**No se diseña ningún otro Command** (p. ej. "UpdateOrganization", "ChangeRole", "DeactivateOrganization") — ninguno está evidenciado por la Functional Specification v1.0. **Siguen siendo exactamente 3.**

---

## 3. Queries

*(Sin cambios respecto a v1.0 — no es consecuencia de H-01/H-02.)*

**Nota de disciplina, en respuesta directa a la observación del Domain Model Audit v1.1:** solo se diseñan las dos Queries con un consumidor concreto ya evidenciado (Academia, Functional Specification v1.0 §9) — no se añade ninguna Query especulativa. **Siguen siendo exactamente 2.**

### `VerifyAuthority`
- **Propósito:** responder si un `Member` (identificado, junto con el `Role` que se le atribuye) tiene autoridad sobre otro `Member` (UC-OM-05).
- **Actor:** Academia (único consumidor evidenciado, Functional Specification v1.0 §9).
- **Datos devueltos:** booleano.
- **Read Model requerido:** `MembershipRepository.findByMemberId` (para ambos `Member`), sin necesidad de un Read Model separado.

**Nota sobre quién decide qué `Role` implica autoridad:** el llamador especifica qué `Role` está evaluando; `VerifyAuthority` solo confirma la existencia de la `Membership` con ese `Role`, sin juzgar su significado — consistente con la conclusión ya alcanzada en la resolución de C-02.

### `EnumerateAuthority`
- **Propósito:** enumerar los `Member` sobre los que un `Member` (con un `Role` dado) ejerce autoridad (UC-OM-06).
- **Actor:** Academia.
- **Datos devueltos:** colección de `MemberId`.
- **Read Model requerido:** `MembershipRepository.findByMemberId` + `MembershipRepository.findByOrganizationId`.

---

## 4. Handlers

*(Sin cambios de fondo respecto a v1.0, salvo la referencia cruzada a la corrección A-01.1 en `RemoveMembershipHandler`.)*

### `RegisterOrganizationHandler`
- **Responsabilidad:** validar la solicitud, crear la `Organization`, persistirla, publicar `OrganizationRegistered`.
- **Aggregate:** `Organization`. **Repository:** `OrganizationRepository`. **Ports:** `UuidGenerator`, `DomainEventPublisher`/`EventBus`.

### `AddMembershipHandler`
- **Responsabilidad:** validar la solicitud; verificar que la `Organization` referenciada existe (Invariante 3); verificar, mediante `findByMemberId`, que no exista ya una `Membership` activa del mismo `Member` en la misma `Organization` (Invariante 2 — ver garantía real y su límite en la Sección 8, corrección A-01); crear la `Membership`; persistirla; publicar `MemberAdded`.
- **Aggregate:** `Membership` (creación); `Organization` (lectura). **Repository:** `OrganizationRepository`, `MembershipRepository`. **Ports:** `UuidGenerator`, `UnitOfWork`, `DomainEventPublisher`.

### `RemoveMembershipHandler`
- **Responsabilidad:** cargar la `Membership`, aplicar su transición a Removida, persistir, publicar `MemberRemoved`. **No evalúa ninguna política de `Authority` posterior al retiro** (corrección A-01.1, Sección 2) — esa evaluación queda fuera del alcance de este Handler en esta versión.
- **Aggregate:** `Membership`. **Repository:** `MembershipRepository`. **Ports:** `DomainEventPublisher`.

### `VerifyAuthorityHandler`
- **Responsabilidad:** consultar `MembershipRepository.findByMemberId` para ambos `Member` y determinar la intersección de `Organization` con el `Role` requerido — sin ninguna escritura.
- **Aggregate:** ninguno. **Repository:** `MembershipRepository` (solo lectura). **Ports:** ninguno adicional.

### `EnumerateAuthorityHandler`
- **Responsabilidad:** consultar `MembershipRepository.findByMemberId`, luego `findByOrganizationId` para enumerar los demás `Member`.
- **Aggregate:** ninguno. **Repository:** `MembershipRepository` (solo lectura). **Ports:** ninguno adicional.

---

## 5. Application Ports

*(Sin cambios respecto a v1.0 — no es consecuencia de H-01/H-02.)*

### Input Ports
No se identifica ningún Input Port adicional más allá de los cinco Command/Query ya definidos.

### Output Ports
`UuidGenerator`, `DomainEventPublisher`, `UnitOfWork` (solo para `AddMembership`), `Logger` — sin cambios.

### Repository Ports
`OrganizationRepository`, `MembershipRepository` — **sin nuevos métodos respecto a v1.0.**

### External Service Ports
Ninguno identificado — sin cambios.

---

## 6. Repository Contracts

*(Sin cambios respecto a v1.0 — no es consecuencia de H-01/H-02. Verificado explícitamente: no aparece ningún Repository nuevo, ningún método nuevo.)*

### `OrganizationRepository`
| Método | Consumidor |
|---|---|
| `findById(organizationId)` | `AddMembershipHandler`. |
| `save(organization)` | `RegisterOrganizationHandler`. |

### `MembershipRepository`
| Método | Consumidor |
|---|---|
| `findById(membershipId)` | `RemoveMembershipHandler`. |
| `save(membership)` | `AddMembershipHandler`; `RemoveMembershipHandler`. |
| `findByMemberId(memberId)` | `AddMembershipHandler`; `VerifyAuthorityHandler`; `EnumerateAuthorityHandler`. |
| `findByOrganizationId(organizationId)` | `EnumerateAuthorityHandler`. |

---

## 7. Authorization

*(Sin cambios respecto a v1.0.)*

| Command/Query | ¿Requiere autorización? | Quién verifica |
|---|---|---|
| `RegisterOrganization` | Conceptualmente sí | **NO DOCUMENTADO** (Scope v1.0 §5). |
| `AddMembership` / `RemoveMembership` | Conceptualmente sí | **Mismo NO DOCUMENTADO.** |
| `VerifyAuthority` / `EnumerateAuthority` | No requieren autorización propia | Son, en sí mismas, el mecanismo que Academia usa para su propia autorización. |

---

## 8. Transacciones

**Corrección A-01 — precisión completa de la garantía transaccional de `AddMembership`:**

| Command | ¿Requiere transacción? | Qué garantiza / qué NO garantiza |
|---|---|---|
| `RegisterOrganization` | No — escritura única sobre un Aggregate nuevo. | N/A. |
| `AddMembership` | **Sí, pero la transacción por sí sola no es una garantía completa — ver desglose abajo.** | Ver desglose. |
| `RemoveMembership` | No — lectura y escritura únicas sobre el mismo Aggregate ya identificado por `membershipId`, sin condición de unicidad que proteger. | N/A. |

**Desglose de `AddMembership` (respuesta directa a la corrección A-01):**

- **Qué garantiza una transacción:** que la secuencia "leer `findByMemberId` → crear y guardar la `Membership`" se ejecute como una unidad indivisible dentro de **una misma invocación** — si falla a mitad de camino, no queda ningún estado intermedio parcial visible (todo o nada, para esa única invocación).
- **Qué NO garantiza:** que **dos invocaciones concurrentes** de `AddMembership` para el mismo par `(Organization, Member)` no puedan, cada una, leer "sin `Membership` activa existente" **antes** de que cualquiera de las dos escriba. Una transacción ordinaria, por sí sola, no impide esta condición de carrera — solo un nivel de aislamiento más estricto (serializable, con su propio costo, no asumido aquí) o una restricción de unicidad complementaria evitarían que ambas invocaciones concluyan creando dos `Membership` activas simultáneas para el mismo par, violando el Invariante 2.
- **Qué mecanismo adicional será necesario (únicamente como dependencia futura, sin diseñarlo):** una restricción de unicidad complementaria sobre la combinación `Organization`+`Member` entre `Membership` activas. Su forma exacta pertenece al futuro Infrastructure Model — **este documento no la nombra, no la diseña y no la traslada a ese documento por adelantado**; solo deja constancia de que la transacción, aunque necesaria, **no es suficiente por sí sola** para garantizar el Invariante 2 bajo concurrencia real.

**Queries (`VerifyAuthority`, `EnumerateAuthority`):** sin cambios — ninguna requiere transacción.

---

## 9. Errores de aplicación

*(Sin cambios respecto a v1.0 — no es consecuencia directa de H-01/H-02; ninguna categoría de error nueva se inventa para la política de `Authority` diferida, Sección 2.)*

- **Errores de validación:** solicitud de `AddMembership` sin `Role`; identificadores mal formados.
- **Errores de "no encontrado":** `Organization`/`Membership` inexistentes.
- **Errores de consistencia:** intento de `AddMembership` que crearía una segunda `Membership` activa para el mismo par — **sujeto ahora a la precisión de la Sección 8**: `AddMembershipHandler` detecta esto en la invocación individual que audita, pero (ver A-01) esta detección no es, por sí sola, una garantía completa bajo concurrencia.
- **Errores de autorización:** NO DOCUMENTADO el mecanismo exacto.
- **Errores recuperables:** ninguno identificado.

---

## 10. Compatibilidad

Verificada de nuevo en esta revisión, contra los mismos 9 documentos — **ninguna contradicción, incluidas las dos correcciones:**
- **Product Architecture v1.0, Organization Strategy v1.0, ADR-001, Scope v1.0, Functional Specification v1.0, Ubiquitous Language v1.0:** sin cambios respecto a v1.0 — ninguna de las dos correcciones introduce capacidad, vocabulario ni concepto nuevo.
- **Domain Model v1.1:** sin cambio — ambas correcciones son de documentación/precisión, no de estructura de Aggregate.
- **Academia:** consumo idéntico — ninguna corrección es visible desde su perspectiva.

---

## 11. Exclusiones — confirmación explícita

Este documento **no contiene**: API REST, DTO HTTP, Prisma, SQL, React, Next.js, Clerk, eventos de infraestructura, Frontend, base de datos. Ninguna de las dos correcciones introduce ninguno de estos elementos — ambas son, exclusivamente, precisión y documentación de un vacío ya señalado.

**No se avanza al Infrastructure Model. Documento detenido.**
