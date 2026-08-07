# ORGANIZATION MANAGEMENT — DOMAIN MODEL AUDIT v1.1 (REVALIDACIÓN)

**Fecha:** 2026-07-31
**Autor:** Auditor DDD independiente, Rédaction Lab
**Documento auditado:** Organization Management Domain Model v1.1 (2026-07-31) — no modificado por esta auditoría.
**Releído completo en esta ronda:** los 8 documentos del nuevo módulo (incluidos v1.0 del Domain Model y su Audit v1.0, para comparar), los 6 documentos del proyecto, y el código real (`TeacherStudentRelationshipPort.ts`, `TeacherStudentRelationshipAdapter.ts`, `AcademyAuthorizationGuard.ts`, `ApplyTeacherOverrideHandler.ts`, `AssignUnitToStudentHandler.ts`, `GetStudentProgressSummaryHandler.ts`, `GetTeacherOverrideHistoryHandler.ts` — releído en esta misma sesión, sin cambios detectados desde la última lectura).

---

## Verificación C-01 — ¿Se resolvió realmente el problema de la colección no acotada?

**¿La solución adoptada elimina el problema?** Sí. Al promover `Membership` a Aggregate Root propio (referenciando `OrganizationId` por identidad, no por composición), cada operación de escritura (crear, retirar una `Membership`) queda acotada a esa única instancia — ya no existe ninguna colección que cargar o bloquear por completo al añadir un solo `Member`. El problema original (contención transaccional a escala) queda genuinamente eliminado, no solo reetiquetado.

**¿`Membership` funciona correctamente como Aggregate Root?** Sí — tiene identidad propia (`MembershipId`), un ciclo de vida distinguible (Creada → Removida), y ninguna necesidad evidenciada de consistencia transaccional conjunta con otra `Membership`. Es un Aggregate deliberadamente pequeño — consistente con la recomendación ya establecida en la literatura DDD de referencia (Vernon, *Effective Aggregate Design*: preferir Aggregates pequeños, favoreciendo consistencia eventual entre ellos sobre una única transacción grande) citada por la auditoría anterior como fundamento del propio hallazgo C-01.

**¿Se respetan los límites transaccionales?** Sí, correctamente descritos y consistentes con la Sección 13 del documento auditado (`Membership` referencia, nunca compone).

**¿Se perdió alguna invariante importante?** No se perdió — se **reclasificó honestamente**. El documento auditado declara explícitamente que el Invariante 2 ("exactamente un Role por Member") ya no es garantizable atómicamente dentro de un único Aggregate, y que su enforcement pasa a depender de Application/Infrastructure futuros. Esto es correcto y esperado en DDD para este tipo de restricción entre Aggregates (mismo patrón ya citado: unicidad de email entre todos los `User`, nunca garantizada por un único Aggregate) — **pero deja un riesgo residual real, ver Sección de Riesgos.**

**¿La nueva distribución introduce inconsistencias?** Una tensión de redacción menor (Sección 2 sigue listando la regla de unicidad como "responsabilidad del dominio", mientras la Sección 11 aclara que su enforcement no ocurre en el dominio) — no es una contradicción real (la regla en sí y su mecanismo de garantía son conceptos distintos en DDD), pero podría confundir a un lector que no lea ambas secciones juntas. Se documenta como hallazgo menor, no crítico.

**Conclusión C-01: resuelto correctamente, sin problema estructural remanente.**

---

## Verificación C-02 — ¿Se justificó correctamente la eliminación de `AuthorityVerificationService`?

**¿Está correctamente justificada?** Sí, y la evidencia se sostiene tras releer fresco, en esta ronda, los cuatro Handlers y `AcademyAuthorizationGuard.ts` — ningún cambio de código desde la auditoría anterior; la cita literal (*"Servicio de aplicación... nunca una regla de negocio de dominio"*) permanece exacta.

**¿El Domain Model sigue siendo completo sin él?** **No del todo — hallazgo nuevo de esta ronda.** El documento auditado retira, junto con el Domain Service, el "puerto de lectura para Authority" de v1.0, remitiendo esa capacidad a un futuro Application Model. Sin embargo, `MembershipRepository` (Sección 8 del documento auditado) se describe **exclusivamente** como *"Cargar/persistir una Membership por MembershipId"* — un único método de búsqueda por la identidad propia del Aggregate. **Ninguna capacidad de Repository permite localizar las `Membership` de un `MemberId` dado** (p. ej., para responder "¿qué Organizaciones/Roles tiene este `teacherId`?") — exactamente el dato que la futura capa de Application necesitaría para reconstruir, de forma legítima, la verificación de `Authority` ya reclasificada.

**¿Existe algún comportamiento que haya quedado "huérfano"?** Sí — la capacidad de consulta por `MemberId` (no por `MembershipId`). **Esto no es una invención especulativa**: el propio proyecto ya tiene un precedente exacto y válido de Repository con métodos de búsqueda más allá de `findById` — `AttemptRepository.findAllByUnitId()`, invocado literalmente en `ApplyTeacherOverrideHandler.ts` (releído en esta ronda: `const previousAttempts = await this.attemptRepository.findAllByUnitId(loaded.id);`). Esto confirma que un método de búsqueda adicional en un Repository de Aggregate (no necesariamente un Read Port de Application aparte) es un patrón ya validado en este mismo proyecto — el documento auditado no lo extendió a `MembershipRepository`, dejando el dato necesario para la Sección 15 (Consumo desde Academia) sin ninguna fuente declarada.

**¿Existe evidencia de que `AuthorityVerificationService` aún debería existir como Domain Service?** No se encontró ninguna — el hallazgo de esta sección es sobre una **capacidad de Repository faltante**, no sobre la necesidad de reintroducir el Domain Service eliminado. La decisión de C-02 en sí (eliminar el Domain Service) permanece correcta y bien fundamentada.

**Conclusión C-02: la decisión de eliminar el Domain Service es correcta y se sostiene; pero la resolución quedó incompleta — falta declarar la capacidad de búsqueda por `MemberId` en `MembershipRepository` para que la responsabilidad reasignada a Application tenga de dónde obtener sus datos.**

---

## Aggregate Roots

| | `Organization` | `Membership` |
|---|---|---|
| **Cohesión** | Alta — su única responsabilidad (identidad) es coherente y mínima. | Alta — une exactamente los tres datos necesarios (`OrganizationId`, `MemberId`, `Role`) sin mezclar responsabilidades ajenas. |
| **Tamaño** | Correcto, deliberadamente mínimo — no es "anémico" en el sentido peyorativo (comportamiento ausente por mal diseño): es mínimo porque Scope v1.0 difirió toda capacidad adicional (Estructura/Jerarquía), no por descuido. | Correcto, deliberadamente pequeño — consistente con la recomendación DDD ya citada. |
| **Responsabilidades** | Registro de su propia existencia — nada más, consistente con Scope v1.0. | Poseer su propia identidad, referenciar `Organization`/`Member`, poseer `Role`. |
| **Referencias** | Ninguna saliente. | A `Organization` y `Member`, ambas por identidad (VO), nunca por objeto — correcto. |
| **Consistencia** | Sin problema — su único invariante (identidad única) es trivialmente garantizable. | Sin problema propio — el invariante que involucra a otra instancia (Invariante 2) está correctamente fuera de su propio límite transaccional, ver Sección de Riesgos. |

**No se encontró ningún problema adicional de delimitación de Aggregates.**

---

## Entities

**No existe ninguna Entity en esta versión** — verificado como correcto: ambos Aggregate Roots son suficientemente simples (sin colecciones internas, sin sub-objetos con ciclo de vida propio) como para no requerir ninguna Entity interna. No se encontró ningún candidato que debiera convertirse en Entity.

---

## Value Objects

Mismo conjunto que v1.0 (`OrganizationId`, `MemberId`, `MembershipId`, `Role`) — se reevaluó cada uno contra el nuevo diseño de dos Aggregates y **ninguno cambió de clasificación**: los cuatro siguen siendo definidos por su valor/identidad inmutable, sin comportamiento propio más allá de la igualdad. No se encontró ningún Value Object mal clasificado.

---

## Repositories

- **`OrganizationRepository`:** suficiente para su alcance actual (identidad mínima) — sin objeciones.
- **`MembershipRepository`:** **insuficiente**, tal como se describe — ver hallazgo de C-02 arriba. No sobra, pero **falta un método de búsqueda por `MemberId`** (o por el par `OrganizationId`+`MemberId`), sin el cual la responsabilidad ya reasignada a Application (verificación/enumeración de `Authority`) no tiene de dónde obtener sus datos.

**No falta ningún Repository adicional** — el hallazgo es de completitud de un método, no de un Repository ausente.

---

## Domain Events

`MemberAdded`/`MemberRemoved`: **sí pertenecen ahora al dominio correcto** — ambos representan transiciones de estado genuinas del Aggregate `Membership` (creación, retiro), correctamente reasignados desde v1.0 (donde se atribuían, incorrectamente, a `Organization`). Sin objeciones.

---

## Invariantes — atención especial a "exactamente un Role por Member por Organization"

**¿Dónde queda garantizada?** En ningún lugar del Domain Model v1.1 — el propio documento lo declara explícitamente, sin ocultarlo, remitiéndola a un mecanismo de Application/Infrastructure todavía no escrito (verificación previa a la creación + restricción de unicidad).

**¿Sigue siendo coherente?** Sí, como regla de negocio declarada — el patrón (invariante de unicidad entre Aggregates, no dentro de uno) es DDD estándar y ya se usó como justificación explícita en la propia resolución de C-01.

**¿Existe riesgo de inconsistencia?** **Sí, real, aunque ya divulgado honestamente.** Mientras no exista un documento de Application/Infrastructure que implemente la verificación previa + restricción de unicidad, no hay **ningún** mecanismo, ni siquiera parcial, que impida crear dos `Membership` activas para el mismo `(Organization, Member)` con `Role` distintos. No es un defecto oculto del documento auditado (que lo declara con honestidad), pero es un riesgo real que debe resolverse antes de que exista cualquier implementación real — se clasifica como riesgo Importante, no crítico, precisamente por estar ya divulgado.

---

## Compatibilidad

Verificada contra los 7 documentos exigidos — **ninguna contradicción encontrada:**
- Product Architecture v1.0: sin cambio de dependencias entre módulos.
- Organization Strategy v1.0: mismos principios (independencia del Modo Individual, desacoplamiento, configurabilidad) intactos.
- ADR-001: genericidad del modelo intacta — ninguno de los cambios de C-01/C-02 introduce vocabulario ni estructura sectorial.
- Scope v1.0: las 5 capacidades mínimas cubiertas exactamente igual que en v1.0, ninguna ampliada ni reducida.
- Functional Specification v1.0: UC-OM-01 a UC-OM-11 siguen mapeando sin fricción a la nueva estructura de dos Aggregates.
- Ubiquitous Language v1.0: mismos 7-8 términos, sin adición ni redefinición.
- Academia: consumo idéntico desde su perspectiva (Sección 15 del documento auditado, correctamente declarado como cambio interno invisible para Academia).

---

## Pureza DDD

Verificado en el texto completo del documento auditado: no aparece ningún Command, Query, DTO, API, REST, HTTP, SQL, Prisma, React, Next.js, Clerk, Infrastructure ni componente de UI. **Sin violaciones.**

---

## Riesgos

**Críticos:** ninguno — ambos hallazgos originales (C-01, C-02) fueron resueltos con evidencia suficiente y sin introducir un defecto estructural equivalente.

**Importantes:**
1. `MembershipRepository` no expone ningún método de búsqueda por `MemberId` — deja la responsabilidad de verificación de `Authority`, ya reasignada correctamente a Application (C-02), sin una fuente de datos declarada en el Domain Model. Evidenciado por precedente real del propio proyecto (`AttemptRepository.findAllByUnitId()`).
2. El Invariante 2 (exactamente un Role por Member por Organization) queda, en esta versión, sin ningún mecanismo de protección — riesgo real de inconsistencia hasta que Application/Infrastructure lo implementen, ya divulgado honestamente por el propio documento.

**Menores:**
3. Tensión de redacción entre Sección 2 y Sección 11 respecto a dónde "vive" la regla de unicidad — ambigüedad de lectura, no contradicción real.

---

## Dictamen

**B) DOMAIN MODEL v1.1 APROBADO CON OBSERVACIONES**

**Justificación:** los dos hallazgos críticos de la auditoría anterior (C-01, C-02) quedaron resueltos correctamente, con evidencia sólida y sin introducir un defecto estructural equivalente — el modelo de dos Aggregates (`Organization`, `Membership`) es coherente, transaccionalmente correcto, y consistente con los 7 documentos previos sin ninguna contradicción. Las observaciones restantes (método de búsqueda faltante en `MembershipRepository`; invariante de unicidad sin protección todavía) son reales y deben resolverse, pero son de naturaleza **aditiva y acotada** (añadir un método a un Repository ya existente; documentar un mecanismo de verificación en un documento futuro) — no exigen reabrir ni rediseñar ningún Aggregate, Value Object o relación ya definidos. No alcanzan el nivel de gravedad que justificaría una tercera corrección estructural del Domain Model antes de continuar.

No se modifica ningún documento. No se redacta Domain Model v1.2. No se avanza al Application Model. Auditoría detenida.
