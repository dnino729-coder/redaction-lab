# ORGANIZATION MANAGEMENT — DOMAIN MODEL v1.1

**Fecha:** 2026-07-31
**Autor:** DDD Expert / Software Architect, Rédaction Lab
**Versión anterior:** v1.0 (2026-07-31, conservada sin modificar por trazabilidad histórica — `organization-management-domain-model-v1.0-2026-07-31.md`), corregida en respuesta a `organization-management-domain-model-audit-v1.0-2026-07-31.md` (dictamen: C, requiere correcciones).
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001; Organization Management Scope v1.0; Organization Management Functional Specification v1.0; Organization Management Ubiquitous Language v1.0; Domain Model v1.1, Application Model v1.5, Infrastructure Model v1.2, API Contract v1.4, Functional Specification v1.3, Blueprint v1.1.1 (todos de Academia); ACP-001 a ACP-004.
**Alcance de esta revisión:** responde exclusivamente a los hallazgos C-01 y C-02 de la auditoría — ninguna capacidad nueva, ningún Aggregate ni Domain Service añadido salvo consecuencia directa de esos dos hallazgos.

---

## Resolución de C-01 — Aggregate `Organization` con colección no acotada de `Membership`

**¿La auditoría tiene razón?** Sí, confirmado tras análisis independiente. Ningún documento contradice la observación: Organization Management Scope v1.0 (§6) ya declara Universidad y Empresa como tipos con consumidor real, y ambos implican, por naturaleza, un volumen de `Membership` potencialmente grande (miles). Academia nunca enfrentó este riesgo porque sus Aggregates (`AcademyUnit`, `Attempt`) están naturalmente acotados por estudiante — no existe, en ningún documento del proyecto, un precedente de Aggregate con colección no acotada que pudiera usarse para defender el diseño original.

**Implicación sobre los límites transaccionales:** el límite original (toda `Membership` dentro de la transacción de su `Organization`) agrupaba un número no acotado de operaciones independientes bajo un único límite, sin que ningún invariante real exigiera esa atomicidad conjunta — cada operación de `Membership` (crear, retirar) solo necesita ser atómica respecto de **esa** `Membership`, nunca respecto de todas las demás de la misma `Organization`.

**Alternativa que mejor respeta Scope v1.0:** promover `Membership` a Aggregate Root propio, referenciando `OrganizationId` por identidad (nunca por composición). Las cinco capacidades de Scope v1.0 (registrar organización, administrar miembros, asignar roles, verificar autoridad, enumerar autoridad) son, sin excepción, operaciones por-`Membership` o de lectura — ninguna exige que `Organization` cargue su colección completa. Esta alternativa es, de hecho, **más** fiel a Scope v1.0 que el diseño original, no una desviación.

**Decisión:** `Membership` se promueve a Aggregate Root propio. No se mantiene el diseño original.

---

## Resolución de C-02 — `AuthorityVerificationService` como Domain Service

**¿La responsabilidad pertenece al dominio o a la Aplicación?** A la Aplicación — confirmado con evidencia directa, releída en esta ronda:

- `AcademyAuthorizationGuard.ts` (código real, Academia) se autodocumenta literalmente: *"Servicio de aplicación — control de autorización (ownership / relación docente-estudiante), nunca una regla de negocio de dominio"*.
- Los cuatro Handlers que consumen esa verificación (`ApplyTeacherOverrideHandler`, `AssignUnitToStudentHandler`, `GetStudentProgressSummaryHandler`, `GetTeacherOverrideHistoryHandler` — los cuatro releídos en esta ronda) invocan `authorizationGuard.assertTeacherRelationship(...)` como un paso de **Application**, antes de cualquier operación de dominio, nunca como parte de un Aggregate ni de un Domain Service.
- Estructuralmente, el proyecto ya distingue (Project Structure Specification v1.0 §7) entre `domain/repositories/` (puertos de Aggregate) y `application/ports/` ("ReadPorts de Query") — la operación de verificar/enumerar `Authority` es, por su propia naturaleza (una consulta de existencia sobre datos, sin regla de negocio propia más allá de "¿existe una `Membership` compatible?"), del segundo tipo, no del primero.

**¿La necesidad surge del dominio o de una limitación del contrato heredado?** Del contrato heredado, predominantemente — la propia justificación original ("Academia invoca `hasRelationship(teacherId, studentId)` sin `organizationId`") depende de la forma actual, no revisada, de un contrato externo, no de una regla de negocio propia de Organization Management. Esto refuerza que la operación no exige una regla de dominio compleja — es, en esencia, una consulta.

**Decisión:** `AuthorityVerificationService` **desaparece del Domain Model**. La responsabilidad de verificar/enumerar `Authority` se reclasifica como responsabilidad de **Application** (análoga a `AcademyAuthorizationGuard`) — su diseño exacto corresponde al futuro Application Model de Organization Management, no a este documento. El Domain Model v1.1 conserva únicamente la regla de negocio subyacente (Sección de Invariantes) y el puerto de Repositorio de Aggregate necesario para que Application pueda construir esa verificación — nunca el mecanismo de consulta cruzada en sí.

---

## 1. Propósito del Bounded Context

*(Sin cambios respecto a v1.0 — no es consecuencia de C-01/C-02.)* Ser la fuente de verdad de la relación entre una `Organization` y sus `Member`, con el `Role` que cada uno ejerce, y exponer esa verdad como un contrato de verificación/enumeración de `Authority` — nada más.

---

## 2. Responsabilidades

*(Sin cambios de fondo respecto a v1.0.)* Pertenece al dominio: registrar `Organization`; registrar/retirar `Membership` con un `Role`; la regla de negocio de unicidad de `Role` por `Member` dentro de una `Organization` (Sección 11). **Ya no pertenece al dominio** (consecuencia de C-02): el mecanismo de verificación/enumeración de `Authority` en sí — se reclasifica como responsabilidad de Application.

---

## 3. Context Mapping

*(Sin cambios — no es consecuencia de C-01/C-02.)* Academia consume (Customer-Supplier); Platform Core provee servicios estándar; Perfil/Authentication es referencia externa pura; Dashboard, Mi Plan, Coach IA, Laboratorio, Evolución, Simulador, Gamificación, Centro de Entrenamiento permanecen independientes.

---

## 4. Aggregate Roots

### `Organization` *(alcance reducido respecto a v1.0)*

**Justificación:** raíz de consistencia transaccional para su propia identidad (registro) — ya **no** compone la colección de `Membership` (corrección de C-01).

**Responsabilidades:** poseer su propia identidad. Nada más en esta versión — sin `Membership` interna.

**Límite transaccional:** el registro de una `Organization` es, en sí mismo, una operación atómica de una única instancia, sin relación con ninguna `Membership`.

### `Membership` *(nuevo Aggregate Root — consecuencia directa de C-01)*

**Justificación:** cada `Membership` (un `Member`, un `Role`, dentro de una `Organization` referenciada por `OrganizationId`) tiene su propio ciclo de vida y no necesita, según la evidencia (Sección de resolución de C-01), consistencia transaccional conjunta con ninguna otra `Membership` de la misma `Organization`.

**Responsabilidades:** poseer su propia identidad (`MembershipId`); referenciar su `Organization` (`OrganizationId`) y su `Member` (`MemberId`) por identidad; poseer su `Role`.

**Límite transaccional:** cada operación (crear, retirar una `Membership`) es atómica respecto de esa única instancia — nunca respecto de otras `Membership` de la misma `Organization`.

**No se identifica un tercer Aggregate Root.**

---

## 5. Entities

**No se identifica ninguna Entity en esta versión** — a diferencia de v1.0 (donde `Membership` era Entity de `Organization`), tras la promoción de C-01, ambos Aggregate Roots (`Organization`, `Membership`) son suficientemente simples como para no requerir ninguna Entity interna propia.

---

## 6. Value Objects

*(Mismo conjunto que v1.0 — ninguno se elimina ni se añade; solo cambia el rol de `MembershipId`.)*

| Value Object | Nota de esta revisión |
|---|---|
| `OrganizationId` | Sin cambio — identidad de `Organization`. |
| `MemberId` | Sin cambio — referencia externa (Perfil/Authentication). |
| `MembershipId` | **Ahora es la identidad del Aggregate Root `Membership`**, no de una Entity interna — mismo Value Object, distinto rol estructural, consecuencia directa de C-01. |
| `Role` | Sin cambio — definido por valor, inmutable. |

---

## 7. Domain Services

**Ninguno.** Consecuencia directa de C-02: `AuthorityVerificationService` se retira del Domain Model. Ninguna otra operación de esta versión (registrar `Organization`, crear/retirar `Membership`) requiere un Domain Service — ambas son responsabilidad directa de su propio Aggregate Root (Sección 4).

---

## 8. Repositories (Ports)

| Repository Port | Alcance |
|---|---|
| **`OrganizationRepository`** | Cargar/persistir una `Organization` por `OrganizationId` — alcance reducido respecto a v1.0 (ya no incluye ninguna `Membership`). |
| **`MembershipRepository`** *(nuevo — consecuencia directa de C-01)* | Cargar/persistir una `Membership` por `MembershipId`. |

**Se retira el "puerto de lectura para Authority" de v1.0** — consecuencia directa de C-02: al reclasificarse la verificación/enumeración de `Authority` como responsabilidad de Application (no de Domain), el puerto de consulta cruzada que la respalda pertenece al futuro Application Model (`application/ports/`, por convención ya establecida en Project Structure Specification §7), no al Domain Model. Este documento no lo diseña.

---

## 9. Factories

*(Sin cambios respecto a v1.0 — no es consecuencia de C-01/C-02.)* No se identifica ningún Factory necesario. Caso candidato ya evaluado y descartado (Domain Model Audit v1.0, Sección 7): un catálogo de `Role` por tipo de `Organization`, no evidenciado hoy.

---

## 10. Domain Events

| Evento | Cuándo se emite (revisado por C-01) |
|---|---|
| `OrganizationRegistered` | Al registrar una `Organization` — sin cambio. |
| `MemberAdded` | **Ahora emitido por el Aggregate `Membership`** al crearse (antes, implícitamente, por `Organization` al añadir una `Membership` a su colección) — mismo evento, corregido el Aggregate emisor como consecuencia directa de C-01. |
| `MemberRemoved` | **Ahora emitido por el Aggregate `Membership`** al retirarse — mismo ajuste. |

**No se añade ningún evento nuevo** — ninguno de los tres cambia de nombre ni de trazabilidad (UC-OM-01/02/03), solo el Aggregate que lo emite.

---

## 11. Invariantes

| Invariante | Ubicación (revisada por C-01) |
|---|---|
| 1. Organización con identidad única | Aggregate `Organization`, sin cambio. |
| 2. Un `Member` tiene exactamente un `Role` dentro de una misma `Organization` | **Reclasificada** (consecuencia directa de C-01): sigue siendo una regla de negocio real, citada literalmente de UC-OM-04, pero **ya no es garantizable atómicamente dentro de un único Aggregate** — su enforcement depende de una coordinación entre instancias de `Membership` (verificación previa a la creación + restricción de unicidad), responsabilidad de Application/Infrastructure en documentos futuros, no de este Domain Model. |
| 3. Una `Membership` solo puede crearse referenciando una `Organization` ya registrada | Aggregate `Membership`, sin cambio de fondo — ahora expresada como precondición de creación del Aggregate `Membership` (antes, precondición de una Entity interna). |
| 4. `Authority` solo entre `Member` de la misma `Organization` | Sin cambio de fondo — regla derivada, resuelta en Application (consecuencia de C-02), nunca en el Domain Model. |
| 5. Sin `Role`, sin `Authority` | Sin cambio de fondo. |

---

## 12. Lifecycle

**`Organization`:** `Registered` → activa indefinidamente. Sin cambio respecto a v1.0.

**`Membership`:** `Created` → activa → `Removed`. Sin cambio de fondo — ahora es el ciclo de vida de un Aggregate Root propio, no de una Entity interna.

---

## 13. Relaciones entre Aggregates *(sección con contenido nuevo — consecuencia directa de C-01)*

Ahora existen dos Aggregate Roots. `Membership` **referencia** a `Organization` exclusivamente mediante `OrganizationId` (nunca por composición ni por objeto directo) y a un `Member` externo exclusivamente mediante `MemberId` — ambas referencias por identidad, respetando el límite de Aggregate (ninguno de los dos Aggregates carga ni depende del estado interno del otro para sus propias invariantes locales). La regla de unicidad entre ambos (Invariante 2) es, por diseño, una invariante **entre** Aggregates, no dentro de uno — coherente con el patrón DDD ya aceptado para este tipo de restricción (análogo a la unicidad de email entre todos los `User` de un sistema, nunca garantizada por un único Aggregate).

---

## 14. Objetos externos

*(Sin cambios respecto a v1.0 — no es consecuencia de C-01/C-02.)* `AcademyUnit`/`Attempt`/`Version`/`TeacherOverride`/`TeacherRecommendation` (Academia); `StudentDashboard` (Dashboard); sesión/JWT (Authentication); `XPTransaction`/`Streak` (Gamification); estructuras internas de los Catálogos del Platform Core.

---

## 15. Consumo desde Academia *(actualizado por C-02)*

Academia, a través de su `AcademyAuthorizationGuard` (ya existente, hoy respaldado por un adaptador fail-closed), invocará — una vez sustituido ese adaptador — la futura capa de **Application** de Organization Management (no un Domain Service, corrección de C-02), pasando dos referencias externas (`teacherId`, `studentId`, tratadas como `MemberId`) y recibiendo un resultado de verificación o una colección, exactamente igual que en v1.0 desde la perspectiva de Academia — **el cambio de C-02 es interno a Organization Management, invisible para Academia**, que sigue consumiendo el mismo contrato conceptual.

---

## 16. Escalabilidad

*(Sin cambios de fondo respecto a v1.0.)* Universidad/Colegio/Instituto/Academia de idiomas/Empresa/ONG/Gobierno: soportado. Marketplace: soportado sin cambio (un `Member` puede tener `Membership` en más de una `Organization` — ahora, de hecho, más natural todavía, al ser `Membership` su propio Aggregate). Franquicias/Holding: no soportado, sin cambio (limitación ya declarada, no resuelta por esta revisión, no era el objeto de C-01/C-02).

---

## 17. Auditoría DDD

- **¿Aggregate Roots correctamente delimitados?** Sí — dos Aggregate Roots (`Organization`, `Membership`), cada uno con límite transaccional acotado a su propia instancia (corrección de C-01).
- **¿Entities pertenecen a un Aggregate?** N/A — no existe ninguna Entity en esta versión.
- **¿Referencias cruzadas indebidas?** No — `Membership` referencia `Organization`/`Member` solo por identidad (Sección 13).
- **¿Conceptos específicos de educación, tecnológicos o de infraestructura?** No — mismos siete/ocho términos ya verificados en v1.0, sin adición.
- **¿DTO, Endpoints, Commands, Queries, casos de uso?** No.

**No se detectó ninguna violación.** No se avanza al Application Model. Documento detenido.
