# ORGANIZATION MANAGEMENT — APPLICATION MODEL v1.0

**Fecha:** 2026-07-31
**Autor:** Software Architect, Rédaction Lab
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001; Organization Management Scope v1.0; Organization Management Functional Specification v1.0; Organization Management Ubiquitous Language v1.0; Organization Management Domain Model v1.1; Organization Management Domain Model Audit v1.1; Application Model v1.5, Domain Model v1.1, Infrastructure Model v1.2, API Contract v1.4, Functional Specification v1.3, Blueprint v1.1.1 (todos de Academia); ACP-001 a ACP-004.
**Alcance:** exclusivamente comportamiento de Application Layer. Sin API REST, sin DTO HTTP, sin Prisma, sin SQL, sin React/Next.js/Clerk, sin eventos de infraestructura, sin Frontend, sin base de datos.

---

## 1. Casos de Uso — trazabilidad exclusiva desde Functional Specification v1.0

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

**No se genera ningún Command/Query adicional** — verificado contra Scope v1.0 (§4, "nada más"): ningún Command/Query de esta sección excede las cinco capacidades ya congeladas.

---

## 2. Commands

### `RegisterOrganization`
- **Propósito:** registrar la existencia de una nueva `Organization` (UC-OM-01).
- **Actor:** actor con capacidad administrativa (Functional Specification v1.0 §3) — mecanismo exacto de autorización **NO DOCUMENTADO** (Sección 7).
- **Aggregate(s) involucrado(s):** `Organization` (creación).
- **Repository requerido:** `OrganizationRepository` (`save`).
- **Resultado esperado:** la `Organization` queda registrada; se emite `OrganizationRegistered`.

### `AddMembership`
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

**No se diseña ningún otro Command** (p. ej. "UpdateOrganization", "ChangeRole", "DeactivateOrganization") — ninguno está evidenciado por la Functional Specification v1.0.

---

## 3. Queries

**Nota de disciplina, en respuesta directa a la observación del Domain Model Audit v1.1:** solo se diseñan las dos Queries con un consumidor concreto ya evidenciado (Academia, Functional Specification v1.0 §9) — no se añade ninguna Query especulativa (p. ej. "ListOrganizations", "GetOrganizationDetails", "ListAllMembersOfOrganization" como capacidad expuesta a un consumidor externo) porque ningún documento evidencia un consumidor real para ellas.

### `VerifyAuthority`
- **Propósito:** responder si un `Member` (identificado, junto con el `Role` que se le atribuye) tiene autoridad sobre otro `Member` (UC-OM-05).
- **Actor:** Academia (único consumidor evidenciado, Functional Specification v1.0 §9).
- **Datos devueltos:** booleano.
- **Read Model requerido:** `MembershipRepository.findByMemberId` (para ambos `Member`), sin necesidad de un Read Model separado — la operación es una intersección de las `Organization` en las que cada `Member` tiene una `Membership` activa, verificando que el primero la tenga con el `Role` indicado.

**Nota sobre quién decide qué `Role` implica autoridad:** ningún documento anterior especifica una regla general de "qué Roles confieren autoridad sobre cuáles otros" — sería una invención introducir aquí una jerarquía de Roles no evidenciada. La lectura mínima y no inventada de UC-OM-05 ("Dado un Miembro **con un Rol**... si tiene autoridad") es que **el llamador especifica qué `Role` está evaluando** (p. ej., Academia, en su propio adaptador, ya sabe que evalúa el `Role` que traduce internamente a "Profesor") — `VerifyAuthority` solo confirma la existencia de la `Membership` con ese `Role`, sin juzgar su significado. Esto es consistente con la conclusión ya alcanzada en la resolución de C-02: la operación es una verificación de existencia, nunca una regla de negocio.

### `EnumerateAuthority`
- **Propósito:** enumerar los `Member` sobre los que un `Member` (con un `Role` dado) ejerce autoridad (UC-OM-06).
- **Actor:** Academia.
- **Datos devueltos:** colección de `MemberId`.
- **Read Model requerido:** `MembershipRepository.findByMemberId` (para localizar la(s) `Organization` donde el `Member` tiene ese `Role`) + `MembershipRepository.findByOrganizationId` (para enumerar los demás `Member` de esa/esas `Organization`, excluyendo al propio llamador).

---

## 4. Handlers

### `RegisterOrganizationHandler`
- **Responsabilidad:** validar la solicitud, crear la `Organization`, persistirla, publicar `OrganizationRegistered`.
- **Aggregate:** `Organization`.
- **Repository:** `OrganizationRepository`.
- **Ports:** `UuidGenerator` (identidad de la nueva `Organization`), `DomainEventPublisher`/`EventBus` (publicación del evento).

### `AddMembershipHandler`
- **Responsabilidad:** validar la solicitud; verificar que la `Organization` referenciada existe (Invariante 3); verificar, mediante `findByMemberId`, que no exista ya una `Membership` activa del mismo `Member` en la misma `Organization` (enforcement del Invariante 2, resolviendo explícitamente la observación pendiente del Domain Model Audit v1.1); crear la `Membership`; persistirla; publicar `MemberAdded`.
- **Aggregate:** `Membership` (creación); `Organization` (lectura).
- **Repository:** `OrganizationRepository`, `MembershipRepository`.
- **Ports:** `UuidGenerator`, `UnitOfWork` (Sección 8), `DomainEventPublisher`.

### `RemoveMembershipHandler`
- **Responsabilidad:** cargar la `Membership`, aplicar su transición a Removida, persistir, publicar `MemberRemoved`.
- **Aggregate:** `Membership`.
- **Repository:** `MembershipRepository`.
- **Ports:** `DomainEventPublisher`.

### `VerifyAuthorityHandler`
- **Responsabilidad:** consultar `MembershipRepository.findByMemberId` para ambos `Member` y determinar la intersección de `Organization` con el `Role` requerido — sin ninguna escritura.
- **Aggregate:** ninguno (Query, sin mutación).
- **Repository:** `MembershipRepository` (solo lectura).
- **Ports:** ninguno adicional.

### `EnumerateAuthorityHandler`
- **Responsabilidad:** consultar `MembershipRepository.findByMemberId` para localizar la `Organization` relevante, luego `findByOrganizationId` para enumerar los demás `Member`.
- **Aggregate:** ninguno.
- **Repository:** `MembershipRepository` (solo lectura).
- **Ports:** ninguno adicional.

**No se diseña implementación** — solo responsabilidad, Aggregate, Repository y Ports, tal como exige el encargo.

---

## 5. Application Ports

### Input Ports
En la convención ya vigente en el proyecto (Academia nunca define una interfaz "Input Port" separada — el propio par Command/Query + Handler **es** el mecanismo de entrada, confirmado releyendo los Handlers de Academia), **no se identifica ningún Input Port adicional** más allá de los cinco Command/Query ya definidos (Secciones 2-3).

### Output Ports
- **`UuidGenerator`** — necesario para `RegisterOrganizationHandler` y `AddMembershipHandler` (generación de `OrganizationId`/`MembershipId`) — mismo puerto ya reutilizado sin cambios en todo el proyecto (Platform Core).
- **`DomainEventPublisher`** *(o el mecanismo de Outbox ya vigente)* — necesario para publicar `OrganizationRegistered`, `MemberAdded`, `MemberRemoved` — mismo patrón ya usado por Academia.
- **`UnitOfWork`** — necesario únicamente para `AddMembership` (Sección 8).
- **`Logger`** — reutilizado del Platform Core, mismo patrón que Academia (`ApplyTeacherOverrideHandler` ya lo usa para registrar la finalización de un Command).

### Repository Ports
`OrganizationRepository`, `MembershipRepository` — ya definidos en Domain Model v1.1, con los métodos ampliados en la Sección 6 de este documento.

### External Service Ports
**Ninguno identificado.** No existe, en ningún documento de esta cadena, evidencia de que Organization Management necesite consumir un servicio externo (IA, notificación) en su versión 1.0 — Scope v1.0 (§3) ya excluyó explícitamente IA y cualquier mecanismo de notificación propio.

---

## 6. Repository Contracts

**Disciplina aplicada, en respuesta directa al encargo:** cada método listado tiene un consumidor identificado en la Sección 4 — ningún método CRUD genérico se añade por costumbre.

### `OrganizationRepository`
| Método | Consumidor |
|---|---|
| `findById(organizationId)` | `AddMembershipHandler` (verificación de existencia, Invariante 3). |
| `save(organization)` | `RegisterOrganizationHandler`. |

**No se añade** `findAll`, `update`, `delete` ni ningún otro método — ningún Handler los necesita.

### `MembershipRepository`
| Método | Consumidor |
|---|---|
| `findById(membershipId)` | `RemoveMembershipHandler`. |
| `save(membership)` | `AddMembershipHandler` (creación); `RemoveMembershipHandler` (transición de estado — nunca una eliminación física). |
| **`findByMemberId(memberId)`** *(nuevo — resuelve directamente la observación pendiente del Domain Model Audit v1.1)* | `AddMembershipHandler` (enforcement del Invariante 2 — ningún documento anterior lo exponía, y su ausencia fue señalada explícitamente como hallazgo); `VerifyAuthorityHandler`; `EnumerateAuthorityHandler`. |
| **`findByOrganizationId(organizationId)`** *(nuevo, justificado exclusivamente por UC-OM-06)* | `EnumerateAuthorityHandler` — único consumidor; necesario para enumerar los demás `Member` de la `Organization` ya localizada mediante `findByMemberId`. |

**Ambos métodos nuevos tienen un consumidor concreto e identificado — ninguno se añade especulativamente.**

---

## 7. Authorization

**Principio, ya vigente en Academia y aplicado sin excepción aquí:** la autorización pertenece a Application, nunca al Domain — ningún Aggregate de Organization Management (`Organization`, `Membership`) verifica autorización por sí mismo.

| Command/Query | ¿Requiere autorización? | Quién verifica |
|---|---|---|
| `RegisterOrganization` | Conceptualmente sí (no cualquiera debería poder registrar una Organización) | **Mecanismo exacto: NO DOCUMENTADO** — ningún documento define el actor autorizado ni el criterio de verificación (Scope v1.0 §5, mecanismo de activación diferido). |
| `AddMembership` / `RemoveMembership` | Conceptualmente sí — el actor con capacidad administrativa (Functional Specification v1.0 §3) | **Mismo NO DOCUMENTADO** — no se inventa un mecanismo aquí. |
| `VerifyAuthority` / `EnumerateAuthority` | **No requieren autorización propia** | Son, en sí mismas, el mecanismo que **otro** Bounded Context (Academia) usa para establecer SU PROPIA autorización — no revelan ningún dato sensible más allá del booleano/colección ya consumido; imponerles una capa adicional de autorización sería redundante y no está evidenciado por ningún documento. |

**Consistencia con Academia:** exactamente el mismo patrón que `AcademyAuthorizationGuard` — un componente de Application, invocado antes de cualquier operación de dominio, nunca dentro del Aggregate.

---

## 8. Transacciones

| Command | ¿Requiere transacción? | Justificación |
|---|---|---|
| `RegisterOrganization` | No — operación de una única escritura sobre un único Aggregate nuevo, sin lectura previa que coordinar. | Mismo criterio ya usado en Academia para Commands de una sola escritura simple. |
| `AddMembership` | **Sí** | La secuencia "leer `findByMemberId` para verificar el Invariante 2 → crear y guardar la `Membership`" debe ser atómica para evitar una condición de carrera (dos solicitudes simultáneas creando dos `Membership` activas para el mismo `(Organization, Member)`) — mismo criterio ya aplicado en Academia para Commands que verifican una precondición antes de escribir (p. ej. `ApplyTeacherOverrideHandler`, que envuelve su verificación+escritura en `UnitOfWork.execute(...)`). |
| `RemoveMembership` | No — una única lectura y una única escritura sobre el mismo Aggregate ya identificado por `membershipId`, sin condición de carrera de unicidad que proteger. |

**Queries (`VerifyAuthority`, `EnumerateAuthority`):** ninguna requiere transacción — son de solo lectura, mismo criterio ya confirmado en Academia (`GetStudentProgressSummaryHandler` no usa `UnitOfWork`).

**No se diseña ningún mecanismo de infraestructura** (ni Prisma, ni SQL) — solo se justifica la necesidad conceptual de atomicidad.

---

## 9. Errores de aplicación

*(Categorías conceptuales, sin códigos HTTP ni catálogo formal — eso pertenece al futuro API Contract.)*

- **Errores de validación:** solicitud de `AddMembership` sin `Role`; solicitud de cualquier Command con un identificador mal formado.
- **Errores de "no encontrado":** `AddMembership` referenciando una `Organization` inexistente (Invariante 3); `RemoveMembership` referenciando una `Membership` inexistente.
- **Errores de consistencia:** intento de `AddMembership` que crearía una segunda `Membership` activa para el mismo `(Organization, Member)` — violación directa del Invariante 2, detectada por `AddMembershipHandler` mediante `findByMemberId` antes de escribir.
- **Errores de autorización:** actor sin capacidad administrativa para `RegisterOrganization`/`AddMembership`/`RemoveMembership` — mecanismo exacto de verificación NO DOCUMENTADO (Sección 7), pero la categoría de error en sí es conceptualmente necesaria.
- **Errores recuperables:** **ninguno identificado** — ningún Command/Query de esta versión invoca un servicio externo (IA, notificación) que pudiera fallar de forma transitoria y recuperable (Sección 5, External Service Ports: ninguno).

---

## 10. Compatibilidad

Verificada contra los 9 documentos exigidos — **ninguna contradicción encontrada:**
- **Product Architecture v1.0:** sin cambio en la matriz de dependencias entre módulos.
- **Organization Strategy v1.0:** los 5 Commands/Queries cubren exactamente las capacidades ya definidas, sin ampliar alcance.
- **ADR-001:** ningún Command/Query introduce vocabulario sectorial — todos operan sobre `Organization`/`Member`/`Membership`/`Role` genéricos.
- **Scope v1.0:** verificado explícitamente en la Sección 1 — ningún Command/Query excede las cinco capacidades congeladas.
- **Functional Specification v1.0:** cada Command/Query traza a un UC-OM ya existente, sin inventar ninguno.
- **Ubiquitous Language v1.0:** ningún término nuevo introducido — se reutilizan exclusivamente los siete/ocho ya congelados.
- **Domain Model v1.1:** los dos Aggregates (`Organization`, `Membership`) se consumen exactamente como fueron diseñados, sin reintroducir ningún Domain Service ya eliminado.
- **Domain Model Audit v1.1:** ambas observaciones pendientes (método `findByMemberId` faltante; invariante de unicidad sin protección) quedan resueltas explícitamente en las Secciones 4 y 6 de este documento.
- **Academia:** el consumo (`VerifyAuthority`/`EnumerateAuthority`) permanece conceptualmente idéntico a lo ya descrito en el Domain Model v1.1 §15 — ningún cambio visible para Academia.

---

## 11. Exclusiones — confirmación explícita

Este documento **no contiene**: API REST, DTO HTTP, Prisma, SQL, React, Next.js, Clerk, eventos de infraestructura (solo Domain Events conceptuales, ya definidos en el Domain Model), Frontend, base de datos. Verificado línea por línea contra el texto completo de este documento.

**No se avanza al Infrastructure Model. No se diseña API Contract. No se diseña Blueprint. Documento detenido.**
