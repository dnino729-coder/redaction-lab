# ORGANIZATION MANAGEMENT — DOMAIN MODEL AUDIT v1.0

**Fecha:** 2026-07-31
**Autor:** Auditor DDD independiente, Rédaction Lab
**Documento auditado:** Organization Management Domain Model v1.0 (2026-07-31) — no modificado por esta auditoría.
**Releído completo en esta ronda:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001; Organization Management Scope v1.0; Organization Management Functional Specification v1.0; Organization Management Ubiquitous Language v1.0; Organization Management Domain Model v1.0; Domain Model v1.1, Application Model v1.5, Infrastructure Model v1.2, API Contract v1.4, Functional Specification v1.3, Blueprint v1.1.1 (Academia); código real: `TeacherStudentRelationshipPort.ts`, `TeacherStudentRelationshipAdapter.ts`, `AcademyAuthorizationGuard.ts`, y en esta ronda adicionalmente `GetStudentProgressSummaryHandler.ts` (verificado fresco, evidencia nueva citada en la Sección 5).

---

## 1. Aggregate Roots

**¿Existe algún Aggregate innecesario?** No — `Organization` es necesario (única raíz evidenciada).

**¿Falta alguno?** **Sí — hallazgo crítico.** El documento auditado modela `Membership` como Entity interna de `Organization`, con la colección completa de `Membership` viviendo dentro del límite transaccional de una única instancia de `Organization`. Para los tipos de organización que el propio producto ya declara soportar (Universidad, Empresa — Organization Management Scope v1.0 §6), el número de `Membership` por `Organization` es, por naturaleza del dominio, potencialmente grande (miles de estudiantes/empleados). Modelar una colección no acotada dentro de un único Aggregate es un anti-patrón DDD ya documentado en la literatura de referencia (Vernon, *Effective Aggregate Design*): cada escritura sobre una sola `Membership` (añadir, retirar) obligaría, en el diseño auditado, a cargar y bloquear conceptualmente toda la `Organization` con todas sus `Membership`, generando contención transaccional real a escala. **`Membership` debería evaluarse como Aggregate Root propio**, referenciando `OrganizationId` por identidad, no por composición — no se rediseña aquí (fuera del alcance de esta auditoría), se documenta como hallazgo.

**¿Los límites transaccionales son correctos?** No, por la misma razón — el límite declarado ("toda operación de escritura... es atómica dentro de una única instancia de `Organization`") es correcto en principio de aislamiento, pero incorrecto en su alcance: agrupa un número potencialmente ilimitado de operaciones independientes (una por `Membership`) bajo un único límite transaccional, cuando ningún invariante real exige esa atomicidad conjunta más allá del par `(Organization, Member)` afectado en cada operación.

**¿Existe algún Aggregate demasiado grande?** Sí — `Organization`, exactamente por lo anterior.

**¿Existe algún Aggregate anémico?** No en sustancia (el documento sí asigna comportamiento a `Organization` — registrar, añadir/retirar `Membership` — Sección 7 del documento auditado), pero sí una **debilidad de exposición**: la Sección 4 del documento auditado nunca enumera esas operaciones directamente sobre el Aggregate; solo se deducen por exclusión, leyendo la Sección 7. Un lector que solo revise la Sección 4 podría concluir, erróneamente, que `Organization` no tiene comportamiento propio.

---

## 2. Entities

**`Membership`:**
- **¿Debe seguir siendo Entity?** Sí, en su naturaleza (tiene identidad y ciclo de vida distinguible en el tiempo — correctamente identificado así en el documento auditado).
- **¿Debería ser Value Object?** No — correcto no serlo, por las mismas razones ya dadas en el documento auditado.
- **¿Debería desaparecer?** No.
- **¿Pertenece realmente al Aggregate actual?** **No, según el hallazgo de la Sección 1** — debería evaluarse como su propio Aggregate Root, no como Entity interna de `Organization`.

---

## 3. Value Objects

**¿Todos cumplen realmente las características de un VO?** Sí — `OrganizationId`, `MemberId`, `MembershipId` (identidad inmutable, sin comportamiento) y `Role` (definido por valor, inmutable) cumplen el criterio en cada caso.

**¿Alguno debería convertirse en Entity?** No.

**¿Falta algún VO importante?** Se evaluó explícitamente si el resultado de `Authority` debería ser un VO enriquecido (en vez de un booleano/colección plano) — **se descarta el hallazgo**: la interfaz real ya Frozen (`TeacherStudentRelationshipPort.hasRelationship(): Promise<boolean>`) confirma que un booleano plano es exactamente la forma ya operativa y consumida — introducir un VO más rico sería sobreingeniería sin evidencia, y el documento auditado acertó al no hacerlo.

---

## 4. Aggregate Boundaries

**Referencias entre Aggregates:** correctas en su principio (`Membership.MemberId` como referencia externa, nunca objeto directo) — pero, dado el hallazgo de la Sección 1, si `Membership` se promoviera a Aggregate Root, también debería referenciar `OrganizationId` por identidad (no por composición), no cambiando el principio ya aplicado, solo su alcance.

**Consistencia transaccional:** ver Sección 1 — el límite actual agrupa más de lo que cualquier invariante real exige.

**Invariantes:** el invariante 2 del documento auditado ("exactamente un `Role` por `Member` dentro de una misma `Organization`") **depende directamente** de que `Membership` viva dentro del límite transaccional de `Organization` para poder garantizarse de forma atómica. Si se corrige el hallazgo de la Sección 1, este invariante **deja de poder enforced dentro de un único Aggregate** — pasaría a depender de una restricción de unicidad a nivel de Application/Infrastructure (patrón ya aceptado en DDD para invariantes que cruzan un volumen no acotado de instancias, análogo a "un email debe ser único entre todos los `User`", nunca garantizado dentro de un solo Aggregate `User`). El documento auditado no anticipa ni menciona esta consecuencia.

**Ownership:** correcto en principio — Organization Management nunca posee la identidad real de la Persona (Perfil), consistente en ambos posibles diseños (actual y corregido).

---

## 5. Domain Services — auditoría de `AuthorityVerificationService`

**¿Es realmente un Domain Service?** Cuestionable — ver los puntos siguientes.

**¿Podría pertenecer a un Aggregate?** No, tal como está descrito — porque no conoce, de antemano, a qué `Organization` pertenecen los dos `Member` a comparar.

**¿Es una responsabilidad de Application?** **Muy probablemente sí — hallazgo crítico, con evidencia directa del propio proyecto.** Se verificó en esta ronda, releyendo fresco el código real (`GetStudentProgressSummaryHandler.ts`, Academia):

```
await this.authorizationGuard.assertTeacherRelationship(request.teacherId, request.studentId);
return this.readModelPort.getStudentProgressSummary(request.studentId);
```

El propio `AcademyAuthorizationGuard` — el componente más cercano y directamente análogo, ya existente en el proyecto, a la operación que `AuthorityVerificationService` pretende resolver — se autodocumenta explícitamente en su propio código como *"Servicio de aplicación — control de autorización... **nunca una regla de negocio de dominio**"* (comentario literal de `AcademyAuthorizationGuard.ts`). Es decir: **el propio proyecto, en su Bounded Context ya Frozen y operativo, ya decidió que la verificación de una relación de autoridad NO es una regla de dominio, es una responsabilidad de Application.** El documento auditado, al clasificar la operación equivalente de Organization Management como Domain Service, **no cita ni descarta explícitamente este precedente directo** — es una inconsistencia real frente a una decisión ya tomada en el mismo proyecto, no solo una preferencia estilística distinta.

Adicionalmente, se confirmó (mismo archivo) que las 9 Queries de Academia consultan `AcademyReadModelPort` **directamente** desde el Query Handler, sin ningún Domain Service intermedio — mismo patrón CQRS que reforzaría la misma conclusión.

**¿Es consecuencia de una limitación del contrato actual de Academia?** **Sí, y esto es el segundo hallazgo crítico de esta sección.** El propio documento auditado justifica la necesidad del Domain Service exclusivamente en que *"el propio consumo real ya documentado (`TeacherStudentRelationshipPort.hasRelationship(teacherId, studentId)`, sin parámetro de Organización) confirma que la operación debe resolver internamente en qué Organización(es) ambos Member comparten una Membership compatible"*. Esto significa que una decisión **estructural** del nuevo Bounded Context (Domain Service vs. Query de Application) está siendo determinada por la **forma actual, no revisada, de un contrato externo de un Bounded Context consumidor** — exactamente el tipo de acoplamiento que la Sección 2 del propio Domain Model (y ADR-001, Principio 2) prohíbe en la dirección inversa (que Organization Management dependa del diseño interno de Academia). Si el contrato de Academia se revisara en el futuro para incluir un `organizationId`, la justificación entera del Domain Service desaparecería — señal de que la decisión no nace de una necesidad intrínseca del dominio de Organization Management.

**¿Depende de infraestructura?** La descripción del propio documento auditado ("coordina lecturas a través de instancias") describe, en sustancia, la responsabilidad de un Read Port/Query Handler de Application, no de un Domain Service (que en DDD opera sobre datos ya cargados, no "busca a través de instancias" por sí mismo).

**¿Depende de otro BC?** Sí — de la forma actual, no de una necesidad de Organization Management (punto anterior).

---

## 6. Repositories

**¿Todos son necesarios?** `OrganizationRepository` sí. El "Puerto de lectura para Authority" (Sección 8 del documento auditado) es necesario en algún nivel, pero, dado el hallazgo de la Sección 5, su consumidor natural sería un Query Handler de Application (como ya hace Academia), no el Domain Service propuesto.

**¿Sobra alguno?** No hay Repository sobrante en sí — el problema no es de cantidad, es de a qué capa pertenece el consumidor del segundo puerto (Sección 5).

**¿Falta alguno?** Si se corrige el hallazgo de la Sección 1 (`Membership` como Aggregate propio), faltaría un `MembershipRepository` explícito, hoy ausente porque `Membership` se modeló como Entity interna, no como raíz con su propio Repository.

---

## 7. Factories

Se intentó activamente encontrar un caso donde sí fueran necesarias. **Caso candidato identificado y descartado con justificación:** si en una versión futura existiera un catálogo de `Role` válidos por tipo de `Organization` (no evidenciado — `Role` es hoy una etiqueta libre, Domain Model auditado §6), un Factory podría ser necesario para construir una `Organization` con su catálogo inicial de `Role` permitidos. **Hoy no aplica** — se confirma la conclusión original del documento auditado: no se identifica ningún Factory necesario en esta versión, con una justificación adicional (el caso candidato) que el documento original no exploró.

---

## 8. Domain Events

**Eventos innecesarios:** ninguno — los tres (`OrganizationRegistered`, `MemberAdded`, `MemberRemoved`) trazan directamente a casos de uso ya evidenciados.

**Eventos faltantes:** no se encontró ninguno adicional evidenciado por la Functional Specification v1.0 — no se inventa uno.

**Eventos que realmente son de Application:** ninguno de los tres — los tres representan transiciones de estado genuinas del Aggregate, consistente con el patrón ya usado en Academia (`TeacherOverrideApplied`).

---

## 9. Invariantes

| Invariante (documento auditado) | ¿Correctamente ubicada? | Observación |
|---|---|---|
| 1. Organización con identidad única | Sí | Sin objeción. |
| 2. Exactamente un Role por Member en una Organización | **No, tras el hallazgo de la Sección 1** | Deja de ser un invariante de Aggregate garantizable atómicamente; pasa a ser una restricción de unicidad de Application/Infrastructure. |
| 3. Membership solo con Organización ya registrada | Sí | Sin objeción. |
| 4. Authority solo entre Member de la misma Organización | Sí, correctamente fuera del Aggregate (en el Domain Service/Application, según se resuelva el hallazgo de la Sección 5) | Consistente con cualquiera de los dos diseños. |
| 5. Sin Role, sin Authority | Sí | Sin objeción. |

**¿Existe alguna invariante olvidada?** Un caso real, no inventado como regla sino señalado como vacío: ningún documento (incluido el auditado) resuelve si retirar una `Membership` que aún ejerce `Authority` activa sobre otros `Member` requiere alguna transición especial — no se propone una regla, se señala la ausencia.

---

## 10. Context Mapping

Verificado sin hallazgos — las dependencias hacia Academia (Customer-Supplier, dirección correcta), Platform Core (consumo estándar), Authentication (referencia pura, sin acoplamiento funcional), Dashboard y Coach IA (independencia total) están todas correctamente descritas en el documento auditado, sin ningún acoplamiento indebido detectado. Esta sección **no encontró errores** — se documenta explícitamente para no dar la impresión de que toda la auditoría es negativa.

---

## 11. Genericidad — intentos de romper el modelo

| Escenario | ¿Rompe el modelo? |
|---|---|
| Universidad, Colegio, Instituto, Academia de idiomas, Empresa, ONG, Gobierno | No — ninguno de los siete requiere vocabulario ni estructura no soportada. |
| Marketplace (de docentes) | No — un `Member` con `Membership` en más de una `Organization` ya es una consecuencia natural del modelo, sin cambio necesario. |
| Franquicia | **Sí rompe** — no existe relación `Organization`-a-`Organization`. **No es un hallazgo nuevo**: el propio documento auditado ya lo declara honestamente en su Sección 16 ("No soportado por este Domain Model v1.0"). |
| Holding empresarial | **Sí rompe, por exactamente la misma razón que Franquicia** — un Holding con subsidiarias exige la misma relación `Organization`-a-`Organization` no modelada. No es una limitación nueva; es la misma ya declarada, manifestada en un escenario adicional del encargo de esta auditoría. |

---

## 12. Escalabilidad

- **Múltiples organizaciones:** soportado, sin objeción.
- **Múltiples membresías:** soportado, sin objeción — sujeto al hallazgo de escala de la Sección 1 (el soporte es correcto conceptualmente, cuestionable en su límite transaccional).
- **Múltiples roles:** soportado **entre** Organizaciones distintas (un Member puede tener Role distinto en cada una); **no** simultáneo dentro de una misma Organización — esto es una regla deliberada (invariante 2), no una limitación de escalabilidad.
- **Crecimiento internacional / múltiples idiomas:** correctamente fuera del alcance del Domain Model — ningún Bounded Context de este proyecto (incluida Academia) modela idioma/locale a nivel de dominio; es una decisión de Presentation (`next-intl`), no un vacío del documento auditado.
- **Futuras jerarquías:** correctamente diferidas y declaradas como tales (`Organizational Unit`/`Structure`), consistente con Scope v1.0.

---

## 13. Pureza DDD

Verificado, término por término, en el texto completo del documento auditado: no aparece ningún Command, Query, DTO, Endpoint, API, Prisma, SQL, framework, React, Next.js, Clerk, REST, HTTP ni componente de UI. Las referencias a "UC-OM-XX" son citas de trazabilidad hacia la Functional Specification v1.0 ya existente, no la definición de un caso de uso nuevo — práctica de citación ya usada de forma idéntica en los documentos de Academia (Application Layer Specification citando CU-XX). **Sin violaciones de pureza DDD.**

---

## 14. Comparación con Academia

**¿Organization Management quedó más limpio?** En proceso documental, sí (secuencia ADR → Scope → Functional Spec → Ubiquitous Language → Domain Model, más disciplinada desde el inicio que la evolución real de Academia, que acumuló varias rondas de auditoría posteriores). **En diseño de Aggregate, no** — Academia nunca enfrentó el riesgo de la Sección 1 porque sus Aggregates (`AcademyUnit`, `Attempt`) están naturalmente acotados por estudiante, nunca contienen una colección de todos los estudiantes de una entidad superior. Organization Management introduce, por la propia naturaleza de "Organización con potencialmente miles de Miembros", un riesgo de diseño que Academia nunca tuvo que resolver.

**¿Repite errores de Academia?** Parcialmente. Evita explícitamente la ambigüedad de "Group" (aprendizaje directo de ACP-001-B) y evita comprometerse prematuramente a un nombre de método (a diferencia de la divergencia `hasRelationship()`/`.exists()` ya señalada en la investigación previa). **Pero repite la misma categoría de riesgo que originó PND-04 en primer lugar**: dejar que una decisión estructural del dominio (Sección 5, Domain Service) se determine por la forma actual y no revisada de un contrato externo, en vez de por evidencia intrínseca del propio Bounded Context.

**¿Aprendió de ACP-001 a ACP-004?** Sí, en terminología (confirmado arriba). No, en el patrón de fondo de PND-04 (acoplamiento de una decisión de diseño a un contrato externo no resuelto).

**¿Existe alguna inconsistencia entre ambos modelos?** Una, ya conocida y no oculta: la convención "Guard" (Academia, `AcademyAuthorizationGuard`) frente a "Service" (Organization Management, `AuthorityVerificationService`) para el mismo tipo de responsabilidad — ya señalada como pendiente en Organization Management Ubiquitous Language v1.0 §9/§10, no un hallazgo nuevo de esta auditoría, pero reforzada por el hallazgo de la Sección 5: si la responsabilidad se reclasifica como Application (no Domain Service), la inconsistencia de nomenclatura se resolvería naturalmente adoptando el mismo patrón "Guard" ya usado por Academia.

---

## 15. Riesgos arquitectónicos

**Críticos:**
1. Aggregate `Organization` con colección no acotada de `Membership` — riesgo real de contención transaccional y rendimiento a escala (Sección 1).
2. La justificación del Domain Service `AuthorityVerificationService` depende de una limitación actual del contrato de consumo de Academia, no de una necesidad intrínseca de Organization Management — y contradice, sin citarlo, el precedente ya Frozen y operativo del propio proyecto (`AcademyAuthorizationGuard`, autodocumentado como Application, nunca Domain) (Sección 5).

**Importantes:**
3. Clasificar la verificación/enumeración de `Authority` como Domain Service, en vez de una Query de Application contra un Read Port (mismo patrón ya usado por las 9 Queries de Academia), no está justificado frente a ese precedente (Sección 5, 14).
4. Si se corrige el hallazgo 1, el invariante "exactamente un Role por Member" deja de ser garantizable atómicamente dentro de un único Aggregate — pasa a depender de una restricción de unicidad de Application/Infrastructure, cambio de naturaleza no anticipado por el documento auditado (Sección 4, 9).
5. Vacío no resuelto: qué ocurre al retirar una `Membership` con `Authority` activa sobre otros `Member` (Sección 9).

**Menores:**
6. La Sección 4 del documento auditado no enumera explícitamente las operaciones del Aggregate `Organization` — solo se deducen por exclusión de la Sección 7 (Sección 1).
7. Inconsistencia de nomenclatura "Guard" vs. "Service" — ya conocida, no oculta (Sección 14).

---

## 16. Dictamen

**C) DOMAIN MODEL REQUIERE CORRECCIONES ANTES DE CONTINUAR**

**Justificación:** los dos hallazgos críticos (Sección 15, riesgos 1 y 2) afectan decisiones estructurales fundamentales — el límite del Aggregate Root y la clasificación Domain Service vs. Application — que el futuro Application Model construiría directamente sobre lo ya definido aquí. Avanzar sin resolverlos arrastraría ambos defectos una capa más adentro (Commands/Queries diseñados sobre un límite transaccional incorrecto y sobre una capa mal clasificada), con un costo de reversión mayor que el de corregirlos ahora — mismo principio de asimetría de costo ya usado, de forma consistente, para justificar otras decisiones en esta misma cadena documental (ADR-001, Sección 3). No se modifica el documento auditado ni se redacta una versión nueva — se documenta el hallazgo, tal como exige el encargo, y se detiene la auditoría aquí.
