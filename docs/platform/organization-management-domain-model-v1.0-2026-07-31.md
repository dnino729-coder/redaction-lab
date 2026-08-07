# ORGANIZATION MANAGEMENT — DOMAIN MODEL v1.0

**Fecha:** 2026-07-31
**Autor:** DDD Expert / Software Architect, Rédaction Lab
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001; Organization Management Scope v1.0; Organization Management Functional Specification v1.0; Organization Management Ubiquitous Language v1.0; Domain Model v1.1, Application Model v1.5, Infrastructure Model v1.2, API Contract v1.4, Functional Specification v1.3, Blueprint v1.1.1 (todos de Academia); ACP-001 a ACP-004.
**Naturaleza de este documento:** primer Domain Model DDD del Bounded Context. Sin código, sin APIs, sin DTO, sin base de datos, sin Frontend.

**Nota de disciplina de alcance (verificada contra Organization Management Scope v1.0 antes de modelar):** Scope v1.0 (§5) difiere explícitamente la "Estructura/Jerarquía configurable multi-nivel" (`Organizational Unit`, `Structure` — ya nombrados en el Ubiquitous Language v1.0, pero sin capacidad asociada en v1.0). **Este Domain Model v1.0, en consecuencia, no modela `Organizational Unit` ni `Structure` como conceptos con comportamiento propio** — solo los cinco conceptos que Scope v1.0 sí congeló como capacidades reales: `Organization`, `Member`, `Membership`, `Role`, `Authority`.

---

## 1. Propósito del Bounded Context

Ser la fuente de verdad de la relación entre una `Organization` y sus `Member`, con el `Role` que cada uno ejerce, y exponer esa verdad como un contrato de verificación/enumeración de `Authority` — nada más (Organization Management Scope v1.0 §1, §4).

---

## 2. Responsabilidades

**Pertenece al dominio:**
- Registrar la existencia de una `Organization`.
- Registrar la `Membership` de un `Member` en una `Organization`, con un `Role`.
- Retirar una `Membership`.
- Determinar, dado un `Member` con un `Role`, si tiene `Authority` sobre otro `Member` de la misma `Organization`.
- Determinar la colección de `Member` sobre los que un `Member` con un `Role` ejerce `Authority`.

**Nunca pertenece al dominio** (Ubiquitous Language v1.0 §6, Functional Specification v1.0 §10):
- Ninguna regla, contenido o progreso pedagógico (Academia).
- Ninguna identidad personal del `Member` más allá de su referencia (Perfil/Authentication).
- Ninguna Estructura/Jerarquía interna de la `Organization` (diferida, nota de alcance arriba).
- Ninguna responsabilidad de facturación, RRHH, ERP, CRM, LMS, calendarios, notas, certificados, biblioteca o inventarios (todas ya excluidas explícitamente en documentos previos).

---

## 3. Context Mapping

| Relación | Contexto | Naturaleza |
|---|---|---|
| **Consume Organization Management** | **Academia** | Customer-Supplier — Academia es cliente aguas abajo, consumidor puro de `Authority` (Sección 15). Único contexto consumidor evidenciado en v1.0 (Scope v1.0 §6). |
| **Provee servicios a Organization Management** | **Platform Core** | Organization Management consume Notification/Error/Permission/Audit Catalog, Logging, Configuration, Secrets, Observability — igual que cualquier módulo (mismo patrón universal ya vigente, nunca a la inversa). |
| **Referencia externa, sin dependencia de comportamiento** | **Perfil / Authentication** | `Member` se referencia por un identificador externo (Sección 6) — Organization Management nunca posee ni consulta activamente la identidad real de una Persona; la referencia es puramente de identidad, no una integración funcional. |
| **Permanecen independientes** | Dashboard, Mi Plan, Coach IA, Laboratorio, Evolución, Simulador, Gamificación, Centro de Entrenamiento | Ninguno consume ni provee nada a Organization Management en esta versión (Scope v1.0 §6/§7). |

---

## 4. Aggregate Roots

### `Organization` — único Aggregate Root de esta versión.

**Justificación:** es la raíz natural de consistencia transaccional para las únicas escrituras ya evidenciadas (registrar la `Organization` misma; añadir/retirar una `Membership`; todas ocurren "dentro" de una `Organization` concreta, nunca a través de dos `Organization` a la vez — ningún documento evidencia una operación que deba ser atómica entre dos Organizaciones distintas).

**Responsabilidades:** poseer su propia identidad; poseer la colección de sus `Membership` internas; garantizar, dentro de su propio límite, el invariante de "exactamente un `Role` por `Member`" (Sección 11).

**Límite transaccional:** toda operación de escritura (registrar la Organización, añadir una Membership, retirar una Membership) es atómica dentro de una única instancia de `Organization`. La operación de verificación/enumeración de `Authority` **no** requiere este límite transaccional — es una lectura, potencialmente a través de instancias de `Organization` distintas si un `Member` perteneciera a más de una (Sección 16) — por eso se resuelve mediante un Domain Service (Sección 7), no mediante un método del propio Aggregate.

**No se identifica un segundo Aggregate Root.** `Membership` se modela como Entity interna de `Organization` (Sección 5), no como Aggregate propio — no existe evidencia de que una `Membership` necesite ciclo de vida o consistencia transaccional independiente de la `Organization` a la que pertenece (mismo criterio de "Aggregate pequeño, salvo evidencia real de lo contrario" ya aplicado consistentemente en todo el proyecto, p. ej. `TeacherOverride` como Entity interna de `AcademyUnit`, nunca como Aggregate propio).

---

## 5. Entities

### Dentro del Aggregate `Organization`:

**`Membership`** — única Entity de esta versión.
- **Responsabilidades:** representar la relación entre la `Organization` (implícita, por pertenecer a su colección interna) y un `Member` externo, junto con el `Role` que ese `Member` ejerce.
- **Por qué es Entity y no Value Object:** tiene una identidad propia distinguible en el tiempo (una `Membership` puede retirarse y, en teoría, un mismo `Member` podría volver a unirse más tarde con un `Role` distinto — son eventos distintos, no el mismo valor inmutable) — mismo criterio ya usado para `TeacherOverride` (Entity interna de `AcademyUnit`) frente a los Value Objects de Academia.

**No se identifica ninguna otra Entity en esta versión** — no existe `OrganizationalUnit` como Entity (diferido, nota de alcance).

---

## 6. Value Objects

| Value Object | Por qué es VO |
|---|---|
| `OrganizationId` | Identidad inmutable, sin comportamiento propio — mismo patrón que `AcademyUnitId` en Academia. |
| `MemberId` | Identidad inmutable que **referencia un actor externo** (la identidad real de la Persona pertenece a Perfil/Authentication, fuera de este Bounded Context) — Organization Management nunca posee el objeto Persona, solo su identificador, igual que Academia ya hace con `StudentId`. |
| `MembershipId` | Identidad inmutable de la Entity `Membership` — mismo patrón que `TeacherOverrideId`. |
| `Role` | Definido enteramente por su valor (una etiqueta configurable, Ubiquitous Language v1.0 §3) — sin identidad propia, comparado por igualdad de valor, inmutable; dos `Membership` con el mismo `Role` textual son intercambiables en ese atributo, a diferencia de una Entity. |

**No se identifica ningún Value Object para `Organizational Unit`/`Structure`** — diferidos (nota de alcance). **No se identifica ningún Value Object para `Authority`** — ya establecido en Ubiquitous Language v1.0 §3 que `Authority` es un resultado derivado, nunca un objeto almacenado.

---

## 7. Domain Services

**`AuthorityVerificationService`** *(nombre ilustrativo del concepto, no una clase diseñada)* — único Domain Service identificado.

**Por qué no pertenece a una Entity ni al Aggregate `Organization`:** la operación de verificar/enumerar `Authority` recibe dos referencias de `Member` (p. ej. desde Academia: un `teacherId` y un `studentId`) **sin conocer de antemano a qué `Organization` pertenecen** — el propio consumo real ya documentado (`TeacherStudentRelationshipPort.hasRelationship(teacherId, studentId)`, sin parámetro de Organización) confirma que la operación debe resolver internamente en qué `Organization`(es) ambos `Member` comparten una `Membership` compatible. Esto excede el límite de una sola instancia de `Organization` — es, por definición DDD, un caso de "proceso significativo que no pertenece a ninguna Entity ni Value Object" (Evans), resuelto como Domain Service que coordina lecturas a través de instancias.

**No se identifica ningún otro Domain Service.** Registrar una `Organization`, añadir/retirar una `Membership` y asignar un `Role` son operaciones que mutan el estado interno de una única `Organization` — pertenecen, sin necesidad de un servicio adicional, al propio Aggregate Root (Sección 4).

---

## 8. Repositories (Ports)

| Repository Port | Propósito | Alcance |
|---|---|---|
| **`OrganizationRepository`** | Cargar y persistir una `Organization` completa (con sus `Membership` internas) por `OrganizationId` — soporta las escrituras del Aggregate (Sección 4). | Escritura, alcance de Aggregate — mismo patrón que `AcademyUnitRepository`. |
| **Puerto de lectura para `Authority`** *(equivalente conceptual a `AcademyReadModelPort` de Academia — mismo patrón CQRS ya vigente en todo el proyecto, sin nombrarlo aquí como clase final)* | Resolver, a partir de dos `MemberId`, si existe una `Membership` compatible que otorgue `Authority`, y enumerar los `MemberId` bajo la autoridad de un `MemberId` dado — sin necesidad de cargar la `Organization` completa. | Lectura optimizada, cruza instancias de `Organization` — consumido por el Domain Service de la Sección 7, nunca directamente por Academia. |

**No se diseña Infrastructure, Prisma ni SQL** — ambos Ports se identifican únicamente como contratos de dominio, consistente con el patrón ya vigente (Domain Model de Academia nunca menciona su propia capa de Infrastructure).

---

## 9. Factories

**No se identifica ningún Factory necesario en esta versión.**

**Justificación:** un Factory se justifica cuando la construcción de un Aggregate involucra lógica no trivial (p. ej. `AttemptFactory` en Academia decide la numeración del siguiente intento). Registrar una `Organization` (Sección 4) no involucra ninguna decisión derivada ni estado inicial complejo — un constructor validado por el propio Aggregate, verificando únicamente sus propios invariantes (Sección 11), es suficiente. Si una versión futura introdujera lógica de creación no trivial (p. ej., al incorporar `Organizational Unit`), este documento debería reabrirse — no se anticipa aquí.

---

## 10. Domain Events

| Evento | Cuándo se emite | Trazabilidad |
|---|---|---|
| **`OrganizationRegistered`** | Al registrar una nueva `Organization`. | UC-OM-01, Functional Specification v1.0. |
| **`MemberAdded`** | Al crear una `Membership` (un `Member` se asocia a una `Organization` con un `Role`). | UC-OM-02/UC-OM-04. |
| **`MemberRemoved`** | Al retirar una `Membership`. | UC-OM-03 — **nota de trazabilidad honesta**: UC-OM-03 ya fue señalado en la Functional Specification v1.0 como "NO DOCUMENTADO explícitamente... inferido por necesidad operativa", no como un requisito explícito de ningún documento anterior a esa especificación. Este evento hereda el mismo estatus evidenciario, no uno más fuerte. |

**No se emite ningún evento para la verificación/enumeración de `Authority`** — es una operación de lectura, nunca una transición de estado (Ubiquitous Language v1.0 §3: "`Authority` es una consecuencia derivada... nunca un concepto que se almacene por sí mismo").

**No se diseña Event Bus ni integración** — solo el catálogo de eventos del propio dominio.

---

## 11. Invariantes

*(Derivadas exclusivamente de la Functional Specification v1.0 — ninguna inventada.)*

**Del Aggregate `Organization`:**
1. Una `Organization` existe con una identidad única desde su registro (UC-OM-01).
2. Un `Member` tiene **exactamente un `Role`** dentro de una misma `Organization` en un momento dado — cita literal de UC-OM-04: *"el sistema le asocia exactamente un Rol organizacional dentro de esa Organización"*. Consecuencia directa: no puede existir más de una `Membership` activa simultánea entre el mismo `Member` y la misma `Organization`.
3. Una `Membership` solo puede crearse entre un `Member` y una `Organization` **ya registrada** — cita de UC-OM-02: *"Dado un Miembro y una Organización ya registrada"*.

**De la operación de `Authority` (Domain Service, no del Aggregate en sí, pero derivada de la misma evidencia):**
4. La `Authority` solo puede verificarse/enumerarse entre `Member` **de la misma `Organization`** — cita literal de UC-OM-05: *"Dado un Miembro con un Rol y otro Miembro de la misma Organización"*.
5. No puede evaluarse `Authority` para un `Member` sin `Role` asignado — implícito en la misma cita ("con un Rol").

**No se inventa ningún invariante adicional** (p. ej., ninguna regla sobre jerarquía de `Role`, límites numéricos de `Membership` por `Organization`, o estados intermedios de aprobación — ninguno de estos aparece en la Functional Specification v1.0).

---

## 12. Lifecycle

**`Organization`:** `Registered` (UC-OM-01) → activa indefinidamente. **NO DOCUMENTADO** ningún estado de desactivación, suspensión o cierre de una `Organization` en ningún documento previo — no se inventa uno aquí.

**`Membership`:** `Created` (`MemberAdded`) → activa → `Removed` (`MemberRemoved`). **NO DOCUMENTADO** ningún estado intermedio (p. ej. "suspendida", "pendiente de aprobación") — no se inventa.

---

## 13. Relaciones entre Aggregates

**No existen relaciones entre Aggregates de Organization Management en esta versión** — `Organization` es el único Aggregate Root (Sección 4).

**Única relación real a documentar:** `Membership` (Entity interna de `Organization`) **referencia** a un `Member` externo exclusivamente mediante `MemberId` (Value Object, Sección 6) — nunca mediante una referencia directa a un objeto Persona. Esto respeta el límite de Aggregate (una Entity interna de `Organization` nunca contiene ni carga un objeto de otro Bounded Context) y el límite de contexto (Perfil/Authentication permanece dueño exclusivo de la identidad real).

---

## 14. Objetos externos (nunca entran al dominio)

| Objeto | Pertenece a | Por qué nunca entra |
|---|---|---|
| `AcademyUnit`, `Attempt`, `Version`, `TeacherOverride`, `TeacherRecommendation` | Academia | Vocabulario y Aggregates ya Frozen de otro Bounded Context (Domain Model v1.1) — prohibido explícitamente (ADR-001 §5, Sección 4 del Ubiquitous Language). |
| `StudentDashboard` | Dashboard | Módulo agregador de otro dominio, sin relación con membresía/autoridad. |
| Cualquier objeto de sesión/coaching de IA | Coach IA | Capacidad transversal ajena, sin relación de dominio. |
| Sesión, JWT, credenciales | Authentication (Clerk, Platform Core) | Organization Management nunca gestiona autenticación — solo referencia identidades ya autenticadas mediante `MemberId`. |
| Cualquier objeto de facturación/suscripción | Billing | **No existe como Bounded Context en ningún documento del producto** — no hay nada que excluir explícitamente, pero se deja constancia de que, si llegara a existir, tampoco entraría aquí. |
| `XPTransaction`, `Streak` | Gamification | Sin relación con membresía/autoridad organizacional. |
| Estructuras internas de `Notification Catalog`/`Permission Catalog`/`Audit Catalog` | Platform Core | Organization Management consume sus contratos ya expuestos, nunca importa sus objetos internos. |

---

## 15. Consumo desde Academia (conceptual, sin diseñar)

Academia, a través de su ya existente `AcademyAuthorizationGuard.assertTeacherRelationship(teacherId, studentId)` (código real, hoy respaldado por un adaptador fail-closed), invocará — una vez sustituido ese adaptador — el Domain Service de la Sección 7, pasando dos referencias externas (`teacherId`, `studentId`, ambas tratadas por Organization Management como `MemberId`) y recibiendo, según la operación:
- Un resultado de verificación (¿existe `Authority`?), para `ApplyTeacherOverride` y `AssignUnitToStudent`.
- Una colección de `MemberId` bajo autoridad, para `GetStudentProgressSummary` (selección múltiple) y `GetTeacherOverrideHistory`.

Academia **nunca** recibe, ve ni conoce ninguna `Organization`, `Membership` ni `Role` completos — solo el resultado ya reducido a booleano/colección (Ubiquitous Language v1.0 §8; Functional Specification v1.0 §9). No se diseña aquí ninguna forma de API, Command ni Query — es, deliberadamente, solo el flujo conceptual.

---

## 16. Escalabilidad

| Escenario | ¿Soportado sin modificar este Domain Model? |
|---|---|
| Universidad, Colegio, Instituto, Academia de idiomas, Empresa, ONG, Gobierno | **Sí** — ninguno de los cinco conceptos modelados (`Organization`, `Member`, `Membership`, `Role`, `Authority`) nombra un sector; ya verificado en Ubiquitous Language v1.0 §11. |
| Marketplace (de docentes) | **Sí, sin cambio** — nada en este modelo impide que un mismo `Member` tenga `Membership` en más de una `Organization` simultáneamente (no existe ningún invariante que lo prohíba); es una consecuencia natural del diseño, no una extensión. |
| Franquicias / Redes de colegios | **No soportado por este Domain Model v1.0** — modelar una relación entre dos `Organization` (matriz/franquicia) no está contemplado; ya señalado como decisión diferida en ADR-001 §11 y Scope v1.0 §5. Se declara honestamente como limitación de esta versión, no como capacidad ya cubierta. |

---

## 17. Auditoría DDD

- **¿Aggregate Roots correctamente delimitados?** Sí — un único Aggregate Root (`Organization`), con `Membership` como su única Entity interna, límite transaccional explícito (Sección 4).
- **¿Entities pertenecen a un Aggregate?** Sí — `Membership` pertenece exclusivamente a `Organization`; ninguna Entity huérfana.
- **¿Existen referencias cruzadas indebidas?** No — `Membership` solo referencia `Member` externo por `MemberId` (Sección 13), nunca por objeto directo.
- **¿Existen conceptos específicos de educación?** No — verificado contra la lista prohibida del encargo (Faculty, Semester, Course, Program, School, Class, Professor, Teacher, Student, Degree, Section, Grade, Department académico): ninguno aparece en ningún Aggregate, Entity, Value Object, Domain Service, Repository, Factory o Domain Event de este documento.
- **¿Existen conceptos tecnológicos?** No.
- **¿Existen detalles de infraestructura?** No — los Repository Ports (Sección 8) se nombran conceptualmente, sin Prisma ni SQL.
- **¿Existen DTO?** No.
- **¿Existen Endpoints?** No.
- **¿Existen Commands?** No.
- **¿Existen Queries?** No.
- **¿Existen casos de uso?** No — se citan los UC-OM-XX de la Functional Specification v1.0 únicamente como trazabilidad de invariantes/eventos, nunca se redefinen ni se diseñan aquí.

**No se detectó ninguna violación.** No se avanza al Application Model. Documento detenido.
