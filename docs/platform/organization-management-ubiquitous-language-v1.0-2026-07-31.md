# ORGANIZATION MANAGEMENT — UBIQUITOUS LANGUAGE v1.0

**Fecha:** 2026-07-31
**Autor:** DDD Expert / Product Architect, Rédaction Lab
**Documentos Frozen respetados sin modificación:** Product Architecture v1.0; Organization Strategy v1.0; ADR-001 Organization Management Vision v1.0; Organization Management Scope v1.0; Organization Management Functional Specification v1.0; Blueprint v1.1.1, Domain Model v1.1, Application Model v1.5, Infrastructure Model v1.2, API Contract v1.4 (todos de Academia); ACP-001 a ACP-004.
**Naturaleza de este documento:** congela exclusivamente el vocabulario del dominio. No contiene Domain Model, entidades, Aggregates, Commands, Queries ni APIs.

---

## 1. Objetivo del lenguaje ubicuo

Establecer el vocabulario canónico, único y no ambiguo de Organization Management, para que toda Functional Specification (ya emitida), Domain Model, Application Model, Infrastructure Model y API Contract futuros usen exactamente los mismos términos, con exactamente el mismo significado — evitando tanto la deriva terminológica ya observada en esta misma investigación (`hasRelationship()` vs. `.exists()`; `GroupTeacher`/`GroupStudent` ya retirados por ACP-001-B) como la colisión con vocabulario ya Frozen de otros Bounded Contexts (Academia, Platform Core).

---

## 2. Principios de nomenclatura

1. **Evitar nombres específicos de sector.** Ningún término puede presuponer un tipo de organización (educativo, corporativo, gubernamental) — justificado por la Decisión de ADR-001 §3 (Bounded Context genérico).
2. **Preferir conceptos de negocio, nunca tecnológicos.** Ningún término del Ubiquitous Language puede nombrar una construcción de infraestructura (tabla, fila, registro, caché) — mismo principio ya aplicado en todo el proyecto (Domain Model de Academia nunca menciona Prisma ni SQL).
3. **Evitar abreviaturas.** Ningún término se abrevia ("Org", "Mbr", "Rel") — reduce ambigüedad y es coherente con la nomenclatura completa ya usada en Academia (`AcademyUnit`, no `AU`; `TeacherOverride`, no `TO`).
4. **Un término, un significado — nunca colisión con vocabulario ya Frozen de otro Bounded Context.** Principio nuevo, propio de este documento, justificado por un hallazgo concreto de esta ronda (Sección 4): el candidato "Permission" ya tiene un significado Frozen y distinto en el Platform Core (`Permission Catalog`, roles de plataforma) — adoptarlo aquí con otro sentido violaría este principio.
5. **Español para la prosa documental, inglés para el vocabulario canónico de código.** Consistente con la convención ya vigente en todo el proyecto (comentarios y documentos en español; identificadores de dominio en inglés — `AcademyUnit`, `TeacherOverride`, `AttemptFactory`) — este documento adopta el mismo patrón dual, sin introducir uno nuevo.
6. **Ningún término se congela sin evidencia de necesidad real.** Mismo criterio de exclusión por defecto ya aplicado en toda la cadena documental (Platform Core Foundation §2; Organization Management Scope v1.0 §5) — un término candidato sin uso real documentado se marca "Pendiente" (Sección 12), nunca se congela por anticipación.

---

## 3. Glosario oficial

*(Los siete términos aprobados — ninguno de los ejemplos del encargo se dio por definitivo sin evaluación.)*

### `Organization`
- **Definición:** la unidad raíz de agrupación del Bounded Context; genérica por diseño, puede representar cualquier tipo de organización (Universidad, Empresa, ONG, etc.).
- **Contexto:** concepto central del Bounded Context; existe con independencia de cualquier sector.
- **Responsabilidades:** ninguna propia más allá de ser la raíz de pertenencia de sus `Member`.
- **Cuándo usarlo:** siempre que se hable de la entidad institucional en sí (una Universidad concreta, una Empresa concreta).
- **Cuándo NO usarlo:** para referirse a una subdivisión interna — eso es `Organizational Unit`.

### `Member`
- **Definición:** una Persona asociada a una `Organization` mediante una `Membership`.
- **Contexto:** es el concepto neutral que reemplaza cualquier término específico de rol pedagógico o corporativo (nunca "Teacher"/"Employee").
- **Responsabilidades:** ninguna propia — es sujeto de `Membership` y de `Role`.
- **Cuándo usarlo:** al referirse a cualquier persona dentro de una `Organization`, sin prejuzgar su función.
- **Cuándo NO usarlo:** para referirse a un usuario sin ninguna `Organization` (ese es, en Modo Individual, simplemente una Persona fuera del alcance de este Bounded Context — Organization Management Functional Specification v1.0 §3).

### `Role` *(Organizational Role)*
- **Definición:** la función que un `Member` ejerce dentro de una `Organization` específica.
- **Contexto:** **distinto, sin excepción, del rol de plataforma** (`STUDENT`/`TEACHER`/`ADMIN`, Permission Catalog, Platform Core) — responde "¿qué función ejerce dentro de esta Organización?", no "¿qué puede hacer en la plataforma?" (ADR-001, Principio 8).
- **Responsabilidades:** determina, junto con `Membership`, si un `Member` tiene `Authority` sobre otro.
- **Cuándo usarlo:** siempre que se hable de la función organizacional de un `Member`.
- **Cuándo NO usarlo:** nunca como sinónimo del rol de plataforma — ver Sección 4.

### `Membership`
- **Definición:** la relación entre un `Member` y una `Organization` (y, dentro de ella, opcionalmente con una `Organizational Unit`).
- **Contexto:** es el registro mínimo ya congelado como capacidad de Scope v1.0 (§2, "Registrar la Pertenencia de un Miembro a una Organización").
- **Responsabilidades:** vincular `Member` con `Organization` y con `Role`.
- **Cuándo usarlo:** al describir la existencia de la relación en sí (crearla, retirarla).
- **Cuándo NO usarlo:** para referirse a la verificación de autoridad entre dos `Member` — eso es `Authority`.

### `Organizational Unit`
- **Definición:** cualquier subdivisión configurable que una `Organization` defina para sí misma.
- **Contexto:** **término deliberadamente genérico** — nunca se nombra "Faculty"/"Department"/"Course" a nivel de Ubiquitous Language; esos son valores de configuración que una `Organization` concreta podría asignar como etiqueta, nunca vocabulario fijo del dominio (Organization Management Functional Specification v1.0 §8).
- **Responsabilidades:** ninguna en la versión 1.0 — la capacidad de `Organizational Unit` está diferida (Scope v1.0 §5); el término se congela aquí para que, cuando se construya, no se invente vocabulario nuevo.
- **Cuándo usarlo:** solo en documentos que discutan la Estructura futura, nunca en el alcance funcional de v1.0.
- **Cuándo NO usarlo:** para nombrar una subdivisión con un término sectorial fijo.

### `Structure`
- **Definición:** la relación configurable entre `Organizational Unit` de una misma `Organization`.
- **Contexto:** se prefiere `Structure` sobre "Hierarchy" porque el nivel exacto de forma (árbol estricto vs. relación más flexible) permanece explícitamente sin decidir (ADR-001, riesgo residual 1) — `Structure` no prejuzga esa forma; `Hierarchy` sí.
- **Responsabilidades:** ninguna en v1.0 — diferida junto con `Organizational Unit`.
- **Cuándo usarlo:** igual que `Organizational Unit`.
- **Cuándo NO usarlo:** como sinónimo de "Hierarchy" en ningún documento que pretenda ser definitivo sobre su forma.

### `Authority`
- **Definición:** la relación verificable/enumerable entre dos `Member` de una misma `Organization`, mediada por el `Role` de uno de ellos.
- **Contexto:** es la crystallización terminológica del concepto ya usado, de forma consistente y repetida (con la palabra "autoridad"), en Organization Strategy v1.0, ADR-001, Scope v1.0 y Functional Specification v1.0 (UC-OM-05/UC-OM-06) — no es un término nuevo, es su forma canónica en inglés.
- **Responsabilidades:** responder "¿tiene autoridad sobre?" (verificación) y "¿sobre quiénes tiene autoridad?" (enumeración) — las dos capacidades hoy bloqueadas de Academia.
- **Cuándo usarlo:** exclusivamente para estas dos operaciones.
- **Cuándo NO usarlo:** como sinónimo de `Role` o de `Membership` — `Authority` es una *consecuencia derivada* de ambos, no un concepto independiente que se almacene por sí mismo.

### `Organization Administrator`
- **Definición:** el `Member` (o actor) con capacidad de gestionar `Membership` y `Role` dentro de una `Organization` — corresponde al "actor con capacidad administrativa" ya identificado sin nombre propio en Organization Management Functional Specification v1.0 §3.
- **Contexto:** **riesgo de colisión ya identificado y resuelto explícitamente**: el nombre podría confundirse con el rol de plataforma `ADMIN` (Permission Catalog, que administra la Biblioteca de Modelos de Academia, P-14 — un concepto completamente distinto). Se nombra completo, "Organization Administrator", nunca abreviado a "Administrator" a secas, precisamente para evitar esa colisión (Principio de nomenclatura 3 y 4).
- **Responsabilidades:** ejecutar las capacidades de gestión de `Membership`/`Role` (UC-OM-02 a UC-OM-04, UC-OM-11 de la Functional Specification).
- **Cuándo usarlo:** siempre que se hable del actor administrativo interno de una `Organization`.
- **Cuándo NO usarlo:** nunca abreviado, nunca como sinónimo del rol de plataforma `ADMIN`.

---

## 4. Términos prohibidos

| Término | Justificación de la exclusión |
|---|---|
| **Group** | Ya retirado explícitamente del vocabulario del proyecto por ACP-001-B ("no existe `Group` como entidad de dominio ni `GroupId`") — aunque esa decisión fue tomada dentro de Academia, el mismo razonamiento (ambigüedad, ya causó un incidente documental real en este proyecto) se aplica aquí con más fuerza todavía: Organization Management ya tiene términos precisos (`Organizational Unit`, `Membership`) que cubren la misma necesidad sin la ambigüedad histórica de "Group". |
| **Class, Semester, Course** | Términos estrictamente sectoriales (educación formal con calendario académico) — su inclusión violaría directamente el Principio de nomenclatura 1 y la Decisión de ADR-001 §3 (Bounded Context genérico); ninguno tiene equivalente necesario en Empresa/ONG/Gobierno. |
| **Professor, Teacher, Student** | Ya son, sin ambigüedad, vocabulario Frozen de Academia (Domain Model v1.1 §2) y roles de plataforma (Permission Catalog) — ya excluidos explícitamente del Ubiquitous Language de Organization Management en ADR-001 §5. Este documento no reabre esa decisión, la hereda. |
| **School, Faculty, Department** | Son nombres fijos de tipos específicos de `Organizational Unit`, válidos únicamente en el sector educativo — su inclusión como vocabulario del dominio (no como configuración) contradiría la genericidad ya congelada (Principio 1); pueden existir como **etiqueta configurada por una Organización concreta**, nunca como término del Ubiquitous Language. |
| **Permission** | **Colisión directa con vocabulario ya Frozen del Platform Core** (`Permission Catalog`, Platform Core Foundation §3) — adoptarlo aquí con un significado distinto ("autoridad organizacional") violaría el Principio de nomenclatura 4. Se usa `Authority` en su lugar. |
| **Instructor, Learner** | Sinónimos más suaves de Teacher/Student, pero igualmente acoplados al sector educativo/formativo — no cubren de forma natural a un "empleado" de Empresa o a un "voluntario" de ONG. Pueden existir como **etiqueta configurada de un `Role`** (dato, no vocabulario del dominio), nunca como término fijo del Ubiquitous Language. |

---

## 5. Sinónimos permitidos

**Ninguno, a nivel de Ubiquitous Language.** Cada candidato de sinónimo evaluado (`Teacher ↔ Instructor`, `Organization ↔ Institution`) fue rechazado por la misma razón: introducir un segundo nombre para el mismo concepto reabre exactamente la ambigüedad que ACP-001-B ya cerró una vez en este proyecto (regla DDD de "un término, un significado", Principio de nomenclatura 4).

**Única correspondencia real, y no es un sinónimo en sentido DDD:** los términos conceptuales ya frozen en español por ADR-001 §5 (Organización, Miembro, Rol, Unidad organizacional, Jerarquía/Estructura, Pertenencia) y sus formas canónicas en inglés de este documento (`Organization`, `Member`, `Role`, `Organizational Unit`, `Structure`, `Membership`) son el **mismo concepto expresado en dos idiomas** (prosa documental vs. vocabulario de código) — no dos conceptos con un puente de sinónimo, consistente con el Principio de nomenclatura 5.

---

## 6. Conceptos externos (pertenecen a otros Bounded Contexts, nunca a Organization Management)

| Concepto | Pertenece a |
|---|---|
| Academia (`AcademyUnit`, `Attempt`, `Version`, `Retroalimentación`) | Academia — Domain Model v1.1, ya Frozen. |
| Authentication / sesión / JWT | Platform Core (Clerk ya vigente, Permission Catalog) — nunca gestionado por Organization Management (Organization Management Scope v1.0 §3). |
| Billing / Suscripciones | **No existe todavía como Bounded Context en ningún documento del producto** — NO DOCUMENTADO, no se le asigna vocabulario propio aquí. |
| Notification | Platform Core (`Notification Catalog`, Platform Core Foundation §4). |
| Gamification | Módulo placeholder propio (`features/gamification`) — sin relación de vocabulario con Organization Management. |
| Dashboard | Módulo agregador propio — consume, no produce, vocabulario de otros contextos. |
| Coach IA | Capacidad transversal propia (AI Orchestrator) — sin relación de vocabulario. |

---

## 7. Conceptos propios (exclusivos de Organization Management)

`Organization`, `Member`, `Role` (organizacional), `Membership`, `Organizational Unit`, `Structure`, `Authority`, `Organization Administrator` — los siete/ocho términos del Glosario oficial (Sección 3). Ninguno se comparte, en su forma interna, con ningún otro Bounded Context.

---

## 8. Conceptos compartidos (mediante contratos, sin diseñarlos)

- **Resultado de `Authority`** (verificación booleana / enumeración) — compartido con Academia, exclusivamente como el resultado ya consumido por `TeacherStudentRelationshipPort` (Functional Specification v1.0, Sección 9). Organization Management nunca comparte `Membership`/`Role` completos con Academia, solo el resultado derivado.
- **Rol de plataforma** (`STUDENT`/`TEACHER`/`ADMIN`) — Organization Management **consume** este concepto del Platform Core (para, por ejemplo, distinguir `Organization Administrator` del rol de plataforma `ADMIN`, Sección 3), pero nunca lo posee ni lo redefine.

---

## 9. Reglas de escritura (convención, sin diseñar entidades)

- **Singular/plural:** conceptos del dominio siempre en singular (`Organization`, `Member`, `Role`); colecciones se refieren en plural solo en prosa, nunca como término propio distinto (`Members` no es un concepto nuevo, es la pluralización de `Member`).
- **PascalCase:** para todo concepto/futuro nombre de tipo del dominio (`Organization`, `OrganizationalUnit`, `OrganizationAdministrator`) — mismo patrón ya usado en Academia (`AcademyUnit`, `TeacherOverride`).
- **camelCase:** reservado para futuros identificadores de instancia/variable, cuando exista código (`organizationId`, `memberId`) — mismo patrón ya usado (`teacherId`, `studentId`); no se diseña aquí, solo se documenta la convención ya vigente en el proyecto.
- **Nombres de futuros Commands (ilustrativo, no es diseño):** Verbo + Objeto, imperativo, PascalCase — mismo patrón ya usado (`ApplyTeacherOverride`, `AssignUnitToStudent`); ejemplo puramente ilustrativo de la convención: "RegisterOrganization", "AssignRole".
- **Nombres de futuras Queries (ilustrativo):** "Get"/"List"/"Verify" + Objeto — mismo patrón ya usado (`GetStudentProgressSummary`, `ListAcademyUnitsForStudent`).
- **Nombres de futuros eventos:** el proyecto ya usa **dos convenciones distintas y coexistentes** — PascalCase pasado para eventos de Application/Domain (`TeacherOverrideApplied`) y MAYÚSCULAS_CON_GUION_BAJO para el Notification/Domain Event Catalog transversal del Platform Core (`PLAN_TASK_COMPLETED`, `ACADEMY_FEEDBACK_READY`). Este documento no decide cuál adopta Organization Management — queda pendiente (Sección 12).

---

## 10. Convenciones para documentación (nomenclatura, no diseño)

| Categoría | Convención | Ejemplo ilustrativo (no es diseño) |
|---|---|---|
| Entidades | Sustantivo singular, PascalCase | `Organization`, `Member` |
| Value Objects de identidad | Sustantivo + `Id`, PascalCase | `OrganizationId`, `MemberId` |
| Repositorios | Sufijo `Repository` | `OrganizationRepository` |
| Servicios de dominio/aplicación | Sufijo `Service` **o** patrón `Guard` (el proyecto ya usa ambos — Academia usa `AcademyAuthorizationGuard` para verificación de autoridad; Mi Plan usa `Service` para orquestación) — **convención dual, no resuelta aquí, pendiente de decisión en el futuro Application Model.** | — |
| Casos de uso | Prefijo `UC-OM-` ya establecido en la Functional Specification v1.0 | `UC-OM-05` |
| DTO | Sufijo `Dto` | `MembershipDto` |
| Adaptadores | Sufijo `Adapter` | `OrganizationRepositoryAdapter` |
| Eventos | Ver Sección 9 (convención dual pendiente) | — |

---

## 11. Compatibilidad futura

Ninguno de los siete/ocho términos del Glosario oficial (Sección 3) necesita modificarse para representar los siete tipos de organización ya evaluados en Organization Management Scope v1.0 (§6, §9):

- **Universidad:** `Organization` = la universidad; `Member` = un docente; `Role` = una etiqueta configurada por esa universidad (p. ej. "Profesor", como dato, nunca como vocabulario fijo).
- **Empresa:** `Organization` = la empresa; `Member` = un empleado; `Role` = otra etiqueta configurada (p. ej. "Gerente").
- **Colegio, Instituto, Academia de idiomas, Gobierno, ONG:** mismo patrón, sin ninguna modificación de vocabulario — el mismo `Organization`/`Member`/`Role`/`Membership` cubre los siete casos sin ramificación.

**Verificado:** el vocabulario funciona sin cambios para los siete tipos, exactamente porque ninguno de sus términos nombra un sector — cumple la exigencia explícita del encargo.

---

## 12. Términos pendientes

- **Vocabulario del mecanismo de activación** ("Invitation" y cualquier término relacionado con el onboarding de un nuevo `Member` o una nueva `Organization`) — no se congela porque el mecanismo mismo está diferido (Organization Management Scope v1.0 §5; ADR-001 §11, riesgo residual 3). Congelar el término antes que el mecanismo sería anticipación especulativa, prohibida por el Principio de nomenclatura 6.
- **Nombre exacto del nivel/tipo dentro de `Structure`** (más allá de `Organizational Unit` genérico) — depende de la decisión, todavía no tomada, del nivel exacto de flexibilidad de la jerarquía (ADR-001 §11, riesgo residual 1).
- **Convención definitiva de nomenclatura de eventos** (PascalCase vs. MAYÚSCULAS_CON_GUION_BAJO, Sección 9/10) — pendiente del futuro Application Model.
- **Si `Authority` requiere sub-vocabulario** (tipos distintos de autoridad) — no evidenciado; hoy solo existe un caso real (autoridad docente-estudiante de Academia); no se inventa una taxonomía sin un segundo caso real.

---

## 13. Auditoría interna

- **¿Contradice ADR-001?** No — este documento crystalliza en inglés el Lenguaje Ubicuo Estratégico ya esbozado en ADR-001 §5, respeta el Principio 8 (separación Rol de plataforma / Rol organizacional) explícitamente en la definición de `Role` y `Organization Administrator`.
- **¿Contradice Scope v1.0?** No — los siete/ocho términos cubren exactamente las cinco capacidades mínimas ya congeladas (registrar organización → `Organization`; administrar miembros → `Member`/`Membership`; asignar roles → `Role`; verificar/enumerar autoridad → `Authority`); ningún término introduce una capacidad nueva.
- **¿Contradice la Functional Specification v1.0?** No — cada UC-OM-01 a UC-OM-11 se expresa sin fricción en este vocabulario (verificado en la Sección 3, cada término cita el UC correspondiente donde aplica).
- **¿Contradice Product Architecture v1.0?** No — ningún término asume dependencia de Academia hacia Organization Management más allá de la ya aislada y descrita.
- **¿Contradice el Blueprint?** No — los términos prohibidos (Sección 4) incluyen explícitamente todo el vocabulario ya Frozen de Academia (Profesor, Estudiante, Curso, Unidad didáctica), preservando el límite de contexto sin excepción.

**No se detectó ninguna contradicción.** No se avanza al Domain Model. No se diseña ninguna entidad, relación, API, tabla, Command, Query ni evento. Documento detenido.
