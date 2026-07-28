# Auditoría Arquitectónica — Domain Model v1.1 vs. Application Model v1.0 (Academia)

**Fuentes:** `docs/audits/academia-domain-model-v1.1-2026-07-19.md` (Frozen, no modificado) y `docs/audits/academia-application-model-v1.0-2026-07-19.md`. **Fecha:** 2026-07-19.
**Objetivo:** clasificar cada "PENDIENTE DE DECISIÓN DE ARQUITECTURA" del Application Model y determinar si el Domain Model requiere una v1.2. Principio rector aplicado en cada decisión: *"El Domain Model solo cambia cuando una regla de negocio no puede expresarse correctamente."* Ninguna resolución A-01–A-10 fue reinterpretada. Ningún patrón, nombre o abstracción fue introducido por elegancia.

---

## Metodología de deduplicación

El Application Model contiene 31 marcas textuales de "PENDIENTE DE DECISIÓN DE ARQUITECTURA". Al auditarlas, se detectó que varias marcas describen la **misma** decisión arquitectónica repetida en secciones distintas del documento (p. ej., la relación docente-estudiante aparece en CMD-10 y de nuevo en la Sección 13 "Seguridad"; la paginación de dos Queries se repite una vez más en la nota general de la Sección 14). Deduplicando, las 31 marcas corresponden a **24 decisiones arquitectónicas distintas**, más el caso especial CMD-11 (analizado aparte, sin contarlo como una "decisión pendiente" convencional porque su propia naturaleza está en cuestión). Cada una recibe un identificador `PND-01` a `PND-24`.

---

## Tabla resumen

| ID | Pendiente | Capa responsable | Impacto | ¿Domain v1.2? | Prioridad |
|---|---|---|---|---|---|
| PND-01 | Frecuencia de autoguardado (CMD-03) | Frontend | Bajo | NO | P3 |
| PND-02 | Disparador de `EvaluateMastery` (CMD-08) | Infrastructure | Medio | NO | P2 |
| PND-03 | Fuente/contrato de evidencia de competencia para `MasteryPolicy` (CMD-08) | Infrastructure | Alto | NO | P1 |
| PND-04 | Verificación de la relación docente-estudiante (CMD-10, Seguridad) | Application | Alto | NO | P1 |
| PND-05 | Baja física vs. lógica de `ModelExample` (CMD-14) | Infrastructure | Bajo | NO | P3 |
| PND-06 | `ModelExample` referenciado por un `Attempt` activo al retirarlo (CMD-14) | Application | Bajo | NO | P3 |
| PND-07 | Disparador de `ProvisionAcademyUnitsForStudent` (CMD-15) | Infrastructure | Medio | NO | P2 |
| PND-08 | Paginación de `ListAcademyUnitsForStudent` (QRY-01) | API | Bajo | NO | P3 |
| PND-09 | Paginación de `GetAttemptHistory` (QRY-04) | API | Bajo | NO | P3 |
| PND-10 | Ordenamiento editorial de `ListModelExamplesByTextType` (QRY-06) | API | Bajo | NO | P3 |
| PND-11 | Paginación de `ListModelExamplesByTextType` (QRY-06) | API | Bajo | NO | P3 |
| PND-12 | Contrato de resolución de membresía de grupo (QRY-08, `groupId`) | Application | Medio | NO | P2 |
| PND-13 | Paginación de `GetGroupProgressSummary` (QRY-08) | API | Bajo | NO | P3 |
| PND-14 | Paginación de `GetTeacherOverrideHistory` (QRY-09) | API | Bajo | NO | P3 |
| PND-15 | Garantías de entrega del Event Bus | Infrastructure | Alto | NO | P2 |
| PND-16 | Clave de idempotencia de `RecordFeedbackDelivered` (CMD-04) | Application | Medio | NO | P2 |
| PND-17 | Protección ante doble clic/reintento de `ApplyTeacherOverride` (CMD-10) | Frontend | Bajo | NO | P3 |
| PND-18 | Umbral de verbosidad de logging por entorno | DevOps | Bajo | NO | P3 |
| PND-19 | Tipo/Value Object de `TeacherId` (`TeacherOverride.autor`) | **Domain** | Medio | **SI** | P1 |
| PND-20 | Reutilización o no de `AuditLog` | Infrastructure | Bajo | NO | P3 |
| PND-21 | Reutilización o no del patrón RLS (`withStudentContext`/`withServiceContext`) | Infrastructure | Medio | NO | P2 |
| PND-22 | Reutilización o no del puerto `UnitOfWork` de Mi Plan | Infrastructure | Medio | NO | P2 |
| PND-23 | Estrategia de modelo de lectura (proyección vs. cálculo en el momento) | Infrastructure | Bajo | NO | P3 |
| PND-24 | Política de invalidación de caché | Infrastructure | Bajo | NO | P3 |
| **CMD-11** | `AssignUnitToStudent` | **Caso especial — ver análisis dedicado** | Alto | **Ver conclusión** | P1 |

**Resultado:** de 24 decisiones pendientes, **23 no requieren modificar el Domain Model** (se resuelven íntegramente en Application, Infrastructure, API, Frontend o DevOps). **Una (PND-19) sí requiere un cambio mínimo del Domain Model.** El caso especial CMD-11 se resuelve por separado, sin generar automáticamente un cambio de Domain Model (ver sección dedicada).

---

## Detalle de cada pendiente

### PND-01 — Frecuencia de autoguardado
**Descripción:** cada cuánto tiempo/evento el cliente invoca `AutosaveDraft`.
**Causa:** el Domain Model (A-06) exige que el mecanismo de continuidad exista y que el estado se restaure exactamente, pero no fija una cadencia.
**Capa responsable:** Frontend.
**Impacto:** Bajo.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** A-06 ya expresa completamente la regla de negocio ("se conserva indefinidamente... restaura exactamente el paso y el contenido"); la cadencia es un parámetro de experiencia de usuario/rendimiento de red, no una regla de negocio. `DraftContent` (Value Object) ya modela correctamente qué se guarda; el "cuándo" no altera el "qué".
**Riesgo de no resolverlo:** pérdida de trabajo del estudiante si la cadencia es muy baja, o carga innecesaria de red/servidor si es muy alta — riesgo operativo/UX, no funcional.
**Prioridad:** P3.

### PND-02 — Disparador de `EvaluateMastery`
**Descripción:** mecanismo que decide cuándo invocar la evaluación de `MasteryPolicy` sobre una Unidad ya `COMPLETED` (job programado, evento de competencia entrante, o ambos).
**Causa:** RN-8/`MasteryPolicy` define completamente el criterio, no el momento de evaluarlo.
**Capa responsable:** Infrastructure.
**Impacto:** Medio.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** el "cuándo evaluar" es una decisión de orquestación/scheduling, no de negocio; `MasteryEvaluationService` ya está correctamente definido como Domain Service invocado externamente (Domain Model, Sección 11) — quién y cuándo lo invoca es responsabilidad de Infrastructure/Application, consistente con la arquitectura hexagonal.
**Riesgo de no resolverlo:** el estado `MASTERED` nunca se calcularía en producción, aunque la regla esté completa — riesgo de feature nunca activada, no de regla incorrecta.
**Prioridad:** P2.

### PND-03 — Fuente/contrato de evidencia de competencia para `MasteryPolicy`
**Descripción:** cómo `MasteryEvaluationService` obtiene las señales de fortaleza/debilidad (`Strength`/`Weakness`, §13.8) que pertenecen a otro Bounded Context (Learning Analytics).
**Causa:** ya reconocida explícitamente como Riesgo 2 en el propio Domain Model v1.1 — dependencia externa no resuelta en su mecanismo, solo en su necesidad.
**Capa responsable:** Infrastructure (contrato de integración/réplica de lectura).
**Impacto:** Alto.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** el Domain Model ya expresa correctamente QUÉ necesita (`MasteryCriterion`, Sección 5) y POR QUÉ (Riesgo 2) — un Domain Service en DDD recibe sus insumos ya resueltos, no decide cómo obtenerlos; resolver el mecanismo de acceso a datos de otro contexto es, por definición, un problema de integración/Infrastructure, no de expresión de una regla de negocio.
**Riesgo de no resolverlo:** `MASTERED` nunca podría calcularse correctamente en producción — bloquea una funcionalidad ya aprobada (A-07).
**Prioridad:** P1.

### PND-04 — Verificación de la relación docente-estudiante
**Descripción:** cómo Application confirma que un Profesor tiene autoridad sobre un Estudiante/grupo antes de permitir `ApplyTeacherOverride`, `GetStudentProgressSummary`, `GetGroupProgressSummary`.
**Causa:** esa relación (`GroupTeacher`, `GroupStudent`, `Enrollment`) pertenece al Bounded Context de Organización Académica (§13.3), no a Academia.
**Capa responsable:** Application (consumidor de un contrato de lectura de otro Bounded Context).
**Impacto:** Alto.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** `TeacherOverridePolicy` ya expresa correctamente QUÉ transiciones son válidas dado un estado (RN-13) — nunca necesitó, ni debe necesitar, saber cómo se resuelve la identidad/autoridad del actor; mezclar esa resolución dentro de Academia violaría el límite de Bounded Context ya definido en la Sección 1 del Domain Model (Academia no posee datos de Organización Académica).
**Riesgo de no resolverlo:** ningún caso de uso del Profesor sobre Academia podría autorizarse correctamente — bloquea A-10 por completo.
**Prioridad:** P1.

### PND-05 — Baja física vs. lógica de `ModelExample`
**Descripción:** si `RetireModelExample` elimina el registro o lo marca inactivo.
**Causa:** RN-16 no distingue entre ambos mecanismos de persistencia.
**Capa responsable:** Infrastructure.
**Impacto:** Bajo.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** ninguna regla de negocio de Academia depende de que `ModelExample` tenga un estado "activo/retirado" explícito en el dominio — es una decisión de estrategia de persistencia sin efecto en el comportamiento observable del estudiante (que de cualquier forma nunca vuelve a ver un ejemplo retirado).
**Riesgo de no resolverlo:** ninguno funcional; solo indecisión operativa de esquema.
**Prioridad:** P3.

### PND-06 — `ModelExample` referenciado por un `Attempt` activo al retirarlo
**Descripción:** qué ocurre si un estudiante está en medio de los pasos Observar/Analizar cuando el Administrador retira ese mismo `ModelExample`.
**Causa:** `Attempt` referencia `ModelExample` solo por identidad y en modo lectura (Domain Model, Sección 15) — no existe ninguna invariante que gobierne la disponibilidad continua de esa referencia.
**Capa responsable:** Application (manejo de la consulta fallida/ausente al momento de lectura).
**Impacto:** Bajo.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** ningún invariante de `Attempt` (Sección 3/8 del Domain Model) depende de la existencia continua de `ModelExample` — es un recurso de lectura externo al ciclo de vida del Intento, análogo a leer un libro de una biblioteca que luego se retira; no hay una regla de negocio que proteger, solo un caso de borde de UX/lectura.
**Riesgo de no resolverlo:** experiencia degradada puntual (ejemplo no disponible), sin riesgo de inconsistencia de datos del dominio.
**Prioridad:** P3.

### PND-07 — Disparador de `ProvisionAcademyUnitsForStudent`
**Descripción:** qué evento externo (onboarding del estudiante, publicación de catálogo, ambos) dispara la creación inicial del catálogo de `AcademyUnit` de un estudiante.
**Causa:** `AcademyUnitFactory`/`UnitSequenceService` ya definen correctamente el estado inicial resultante; no definen el disparador temporal.
**Capa responsable:** Infrastructure (suscripción a evento de otro Bounded Context, p. ej. Autenticación/Perfil).
**Impacto:** Medio.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** el "cuándo" de la provisión es orquestación entre Bounded Contexts, no una regla de Academia; la Factory ya encapsula toda la lógica de creación relevante al dominio (Domain Model, Sección 12).
**Riesgo de no resolverlo:** ningún estudiante tendría Unidades de Academia visibles — bloquea el uso del módulo completo, pero no por un defecto de regla, sino de integración.
**Prioridad:** P2.

### PND-08, PND-09, PND-11, PND-13, PND-14 — Paginación de Queries (`ListAcademyUnitsForStudent`, `GetAttemptHistory`, `ListModelExamplesByTextType`, `GetGroupProgressSummary`, `GetTeacherOverrideHistory`)
**Descripción:** tamaño de página, mecanismo (offset vs. cursor) para cinco Queries de solo lectura.
**Causa:** el Domain Model no define, ni debe definir, contratos de listado — las Queries son responsabilidad exclusiva de Application/API.
**Capa responsable:** API.
**Impacto:** Bajo (cada una individualmente).
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** ningún Aggregate, Policy o Specification del Domain Model expone ni necesita expresar un contrato de paginación — es, por definición, un detalle de interfaz de lectura (Ports & Adapters: el puerto de Query es responsabilidad de Application/API, nunca del dominio).
**Riesgo de no resolverlo:** sobrecarga de payload en listados que crecen sin límite (particularmente `GetAttemptHistory`, dado el Hallazgo H-06 del Domain Model: repetición y ciclos de reescritura sin límite superior) — riesgo de rendimiento, no de corrección funcional.
**Prioridad:** P3 (P2 seria razonable solo para `GetAttemptHistory` por su crecimiento potencialmente ilimitado, pero no bloquea ningún sprint de dominio/aplicación).

### PND-10 — Ordenamiento editorial de `ListModelExamplesByTextType`
**Descripción:** criterio de orden (fecha, calificación, curaduría manual) para listar `ModelExample`.
**Causa:** RN-16 no define ningún criterio de orden, solo pertenencia a un `TextType`.
**Capa responsable:** API.
**Impacto:** Bajo.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** a diferencia de `FeedbackCategory` (cuyo orden SÍ es una regla de negocio, ya corregida explícitamente en H-07 con un atributo `priority`), el orden de presentación de `ModelExample` no tiene ningún fundamento documental de ser una regla de negocio — es puramente editorial/de presentación.
**Riesgo de no resolverlo:** inconsistencia de experiencia de usuario, sin efecto funcional.
**Prioridad:** P3.

### PND-12 — Contrato de resolución de membresía de grupo
**Descripción:** cómo Application resuelve la lista de estudiantes de un `groupId` para `GetGroupProgressSummary`.
**Causa:** `Group`/`GroupStudent`/`Enrollment` (§13.3) pertenecen a Organización Académica, no a Academia.
**Capa responsable:** Application (contrato de integración de lectura).
**Impacto:** Medio.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** misma razón que PND-04 — Academia no debe, ni necesita, poseer datos de membresía de grupo; solo necesita recibir una lista de `StudentId` ya resuelta desde el contrato externo.
**Riesgo de no resolverlo:** el Profesor no podría ver progreso agregado por grupo (parte de A-10), aunque sí por estudiante individual (QRY-07, no bloqueado).
**Prioridad:** P2.

### PND-15 — Garantías de entrega del Event Bus
**Descripción:** at-least-once vs. exactly-once, reintentos, dead-letter queue para la publicación de `UnitCompleted`, `EXTERNAL_ACTIVITY_COMPLETED`, `UnitMastered`, `UnitUnlocked`.
**Causa:** RN-9/RN-10 ya garantizan "exactamente una vez" como regla de **dominio** (el Aggregate nunca vuelve a emitir el evento); la garantía de **entrega** del evento ya emitido es un problema de mensajería.
**Capa responsable:** Infrastructure.
**Impacto:** Alto.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** la Sección 17 del Domain Model (Event Driven, auditoría DDD previa) ya distinguió correctamente esta separación de responsabilidades: la regla de "exactamente una vez" a nivel de dominio no depende de las garantías de entrega del transporte. Es razonable, y se recomienda explícitamente, **reutilizar el mismo Event Bus/mecanismo ya operativo para los eventos de Mi Plan**, en vez de diseñar uno nuevo para Academia.
**Riesgo de no resolverlo:** pérdida silenciosa de un evento crítico (p. ej. `EXTERNAL_ACTIVITY_COMPLETED` nunca llega a Mi Plan) — riesgo real de integración, pero de plataforma, no de Academia en particular.
**Prioridad:** P2 (verificar reutilización, no diseñar desde cero).

### PND-16 — Clave de idempotencia de `RecordFeedbackDelivered`
**Descripción:** cómo deduplicar una entrega repetida de Retroalimentación para la misma `Version`.
**Causa:** el contrato Customer-Supplier con Coach IA puede reintentar entregas.
**Capa responsable:** Application.
**Impacto:** Medio.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** el par `(attemptId, versionNumber)` ya existe como identidad natural en el Domain Model (`VersionNumber`, Value Object ya definido, Sección 5) — es suficiente como clave de idempotencia sin necesidad de ningún concepto nuevo de dominio.
**Riesgo de no resolverlo:** duplicación de `Feedback` para la misma `Version`, violando de facto (aunque no de derecho) la relación 1:1 ya declarada en el Domain Model (Sección 4: "identidad: asociada 1:1 a la Version que evalúa").
**Prioridad:** P2.

### PND-17 — Protección ante doble clic/reintento de `ApplyTeacherOverride`
**Descripción:** evitar que un doble clic del Profesor genere dos registros de `TeacherOverride`.
**Causa:** cada invocación crea una entidad de auditoría con su propia identidad (Domain Model, Sección 4).
**Capa responsable:** Frontend (debounce/deshabilitar botón), reforzado opcionalmente por una clave de idempotencia de cliente en Application.
**Impacto:** Bajo.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** el problema es de interacción de interfaz, no de expresión de una regla de negocio — `TeacherOverridePolicy` ya define correctamente cuándo una acción es válida según el estado; el riesgo es puramente de UX repetitiva.
**Riesgo de no resolverlo:** registros de auditoría duplicados con el mismo efecto — molestia de datos, no error funcional (el segundo `FORCE_LOCK` sobre una Unidad ya `LOCKED` sería rechazado por la propia Policy si el estado ya cambió, mitigando parcialmente el riesgo incluso sin resolver esto).
**Prioridad:** P3.

### PND-18 — Umbral de verbosidad de logging por entorno
**Descripción:** nivel de log activo en desarrollo/staging/producción.
**Causa:** configuración operativa estándar de cualquier módulo.
**Capa responsable:** DevOps.
**Impacto:** Bajo.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** no involucra ningún concepto de dominio.
**Riesgo de no resolverlo:** ruido operativo o falta de visibilidad — riesgo puramente operativo.
**Prioridad:** P3.

### PND-19 — Tipo/Value Object de `TeacherId` — **ÚNICO CANDIDATO A DOMAIN MODEL v1.2**
**Descripción:** `TeacherOverride.autor` (Domain Model, Sección 4) se describe como "atributo conceptual" sin tipo formal, a diferencia de `StudentId`, que sí está formalmente declarado como Value Object (Sección 5) para el mismo propósito (referenciar una identidad externa de actor).
**Causa:** asimetría real dentro del propio Domain Model v1.1 — no una preferencia estética.
**Capa responsable:** **Domain**.
**Impacto:** Medio.
**¿Requiere modificar Domain Model?:** **SI**.
**Justificación técnica:** `TeacherOverride` es una Entidad de Domain cuyo propósito central es la trazabilidad ("Anulación docente", Sección 2, Ubiquitous Language) — RN-13 y la Sección 12 de este mismo Application Model dependen de poder representar de forma inequívoca "quién" aplicó la anulación. El Domain Model ya resolvió exactamente este mismo problema para el Estudiante (`StudentId`, Value Object, Sección 5) por la misma razón (Academia no posee al actor, solo lo referencia). Dejar `autor` sin tipo formal es una **omisión real de modelado**, no una decisión de implementación: un Value Object es, por definición, un concepto de Domain (Sección 5 del propio documento), no de Application ni de Infrastructure — Application no puede "inventar" un Value Object de Domain sin violar la regla "Application → Domain, nunca al revés" (Sección 2 del Application Model). Esta es la única regla de negocio de las 24 auditadas que **no puede expresarse correctamente** sin tocar el Domain Model, cumpliendo exactamente el principio rector de esta auditoría.
**Riesgo de no resolverlo:** el Sprint 4.3 (Domain Layer) tendría que decidir el tipo de `autor` sin respaldo del contrato congelado, arriesgando una implementación inconsistente con el patrón ya usado por `StudentId`, o un cambio de tipo posterior que sí sería breaking change sobre `TeacherOverride`.
**Prioridad:** P1 — debe cerrarse antes de Sprint 4.3.

### PND-20 — Reutilización o no de `AuditLog`
**Descripción:** si el registro de auditoría de Academia usa la tabla `AuditLog` ya existente (§13.11) o un mecanismo propio.
**Capa responsable:** Infrastructure.
**Impacto:** Bajo.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** es una decisión de persistencia de un dato ya completamente modelado en el dominio (`TeacherOverride`, Sección 4) — el Domain Model no necesita saber dónde se persiste su propio registro de auditoría.
**Riesgo de no resolverlo:** duplicación de mecanismos de auditoría en el proyecto si se decide mal, sin riesgo funcional para Academia en sí.
**Prioridad:** P3.

### PND-21 — Reutilización o no del patrón RLS (`withStudentContext`/`withServiceContext`)
**Descripción:** si Academia aplica el mismo patrón de contexto de sesión Postgres ya resuelto para Mi Plan (Resolución 18.24).
**Capa responsable:** Infrastructure.
**Impacto:** Medio.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** 18.24 ya demostró, en este mismo proyecto, que este tipo de decisión pertenece íntegramente a Infrastructure (`UnitOfWork.execute(work, studentId?)`) sin tocar el Domain Layer de Mi Plan — el mismo razonamiento aplica sin excepción a Academia.
**Riesgo de no resolverlo:** repetir, en Academia, exactamente la misma deuda arquitectónica que motivó la Resolución 18.24 en Mi Plan si se decide implícitamente durante el desarrollo en vez de explícitamente antes.
**Prioridad:** P2.

### PND-22 — Reutilización o no del puerto `UnitOfWork` de Mi Plan
**Descripción:** si Academia extiende/reutiliza el puerto `UnitOfWork` ya definido para Mi Plan o define uno propio.
**Capa responsable:** Infrastructure.
**Impacto:** Medio.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** un puerto de `UnitOfWork` es, por definición arquitectónica ya establecida en este proyecto (Mi Plan, Application Layer), un contrato de Application/Infrastructure, no de Domain — el patrón de sincronización eventual entre `AcademyUnit`/`Attempt` (Sección 7 del Application Model) es compatible con cualquiera de las dos opciones.
**Riesgo de no resolverlo:** dos puertos `UnitOfWork` distintos y potencialmente inconsistentes conviviendo en el mismo proyecto.
**Prioridad:** P2.

### PND-23 — Estrategia de modelo de lectura (proyección materializada vs. cálculo en el momento)
**Descripción:** cómo se construyen las respuestas de `ListAcademyUnitsForStudent`/`GetStudentProgressSummary`.
**Capa responsable:** Infrastructure.
**Impacto:** Bajo.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** la Sección 18 de la auditoría DDD previa (Sprint 4.2.1) ya confirmó que el Domain Model es apto para CQRS sin cambios — la estrategia concreta del lado de lectura es, por definición, responsabilidad de Infrastructure/Application, nunca de Domain.
**Riesgo de no resolverlo:** rendimiento subóptimo en el peor caso, sin riesgo de corrección.
**Prioridad:** P3.

### PND-24 — Política de invalidación de caché
**Descripción:** TTL/estrategia de invalidación para `ListModelExamplesByTextType` y el catálogo de `UnitSequenceService`.
**Capa responsable:** Infrastructure.
**Impacto:** Bajo.
**¿Requiere modificar Domain Model?:** NO.
**Justificación técnica:** el dominio ya declara estos datos como de cambio infrecuente (contenido editorial) — la estrategia de caché es puramente una optimización técnica sin efecto en ninguna regla.
**Riesgo de no resolverlo:** datos desactualizados brevemente visibles tras una edición del Administrador — riesgo de UX, no de corrección del dominio.
**Prioridad:** P3.

---

## Caso especial — CMD-11 `AssignUnitToStudent`

**Pregunta:** ¿A) incorporar al Domain Model, B) eliminar del Application Model, o C) replantear como otro caso de uso?

**Análisis desde DDD:**

1. **A-10 aprueba literalmente** que el Profesor "puede asignar unidades específicas de Academia a un estudiante o a un grupo completo, además de la asignación genérica de actividades ya prevista." Esto es una capacidad funcional ya vinculante — no puede descartarse sin más (descarta una eliminación silenciosa).

2. **El Domain Model v1.1 no modela ningún concepto de "asignación".** A diferencia de `FORCE_LOCK`/`FORCE_RESTART` (ambos formalizados como valores de `OverrideAction`, con `TeacherOverridePolicy` gobernando su elegibilidad exacta por estado), "asignar" no tiene ningún Aggregate, evento, Policy o Specification que lo represente. Esto no es un olvido de este documento: **la propia auditoría DDD del Sprint 4.2.1 no señaló este vacío porque nunca existió en el modelo auditado** — la ausencia es del diseño original del Domain Model v1.1, heredada intacta hasta este punto.

3. **A-10 no aclara qué significa "asignar" en términos de comportamiento observable.** Existen al menos dos lecturas igualmente válidas del texto de la resolución, mutuamente incompatibles en su implementación:
   - **Lectura 1 (metadato/recomendación):** el Profesor marca una Unidad como recomendada/prioritaria para un estudiante, sin alterar `UnitState` en absoluto — un dato puramente informativo, análogo a una nota del profesor, que no requiere ningún cambio de dominio (se resolvería como una anotación de lectura, posiblemente ni siquiera propiedad de Academia sino del ecosistema "Espacio del Profesor", que el propio corpus del proyecto define como **producto independiente** del espacio del estudiante, §6.14 — un Bounded Context que el Domain Model v1.1 de Academia ni siquiera incluye en su Context Mapping, Sección 1).
   - **Lectura 2 (desbloqueo anticipado):** el Profesor hace accesible una Unidad fuera del orden natural de progresión, antes de que `UnlockPolicy` la habilitaría por sí sola — esto SÍ requeriría comportamiento de dominio nuevo: una acción de anulación análoga a `FORCE_RESTART` pero aplicable desde `LOCKED` (hoy `TeacherOverridePolicy` solo permite `FORCE_RESTART` desde `COMPLETED`/`MASTERED`, RN-13) — es decir, un nuevo valor de `OverrideAction` (p. ej. `FORCE_UNLOCK`) y una extensión mínima de `TeacherOverridePolicy`.

4. **No es competencia de este documento decidir cuál lectura es la correcta.** Elegir una de las dos sin confirmación equivaldría a "inventar una regla de negocio" — exactamente lo que esta auditoría tiene prohibido hacer. La ambigüedad es de **A-10 misma**, no una omisión técnica de este análisis.

**Conclusión — Opción C, condicionada:**

CMD-11 debe **replantearse**, no incorporarse directamente (A) ni eliminarse silenciosamente (B). El replanteamiento correcto, antes de tocar cualquier documento técnico, es una **clarificación funcional de A-10** (fuera del alcance de una auditoría arquitectónica: pertenece a quien emitió la resolución) que determine cuál de las dos lecturas — o ambas — es la intencionada. Una vez clarificado:
- Si resulta ser la Lectura 1 (metadato/recomendación): **no se requiere ningún cambio al Domain Model de Academia** — el caso de uso se reformula como una capacidad de lectura del ecosistema "Espacio del Profesor" (otro Bounded Context, no auditado aquí), que consume los contratos de lectura ya existentes de Academia (QRY-01, QRY-07, QRY-08) sin necesidad de escritura sobre `AcademyUnit`.
- Si resulta ser la Lectura 2 (desbloqueo anticipado): **sí calificaría como una extensión legítima y mínima del Domain Model** (nuevo valor de `OverrideAction` + regla de elegibilidad en `TeacherOverridePolicy`), bajo el mismo principio que ya justificó `FORCE_LOCK`/`FORCE_RESTART` en A-10 — pero solo tras esa confirmación explícita, no como una decisión unilateral de este documento.

**Por lo tanto, CMD-11 permanece fuera del Domain Model v1.1 y fuera del Change Proposal de esta auditoría**, marcado como **"pendiente de clarificación funcional de A-10"**, distinto en naturaleza de los 24 `PND` (que son decisiones técnicas resolubles sin tocar ninguna resolución).

---

## Domain Model v1.2 Change Proposal

*(Se emite porque PND-19 constituye un cambio indispensable. No se genera todavía el documento Domain Model v1.2 — solo esta propuesta, conforme a lo solicitado.)*

### Cambio CH-01 — Formalizar `TeacherId` como Value Object

**Identificador:** CH-01.
**Motivo:** eliminar la asimetría de modelado entre `StudentId` (Value Object formal, Sección 5 del Domain Model v1.1) y `TeacherOverride.autor` (atributo conceptual sin tipo, Sección 4).
**Problema que resuelve:** la imposibilidad de expresar, con la misma rigurosidad ya aplicada al Estudiante, la identidad del actor responsable de una `TeacherOverride` — un dato central para RN-13 y para el requisito de auditoría (Sección 12 del Application Model).
**Regla de negocio involucrada:** RN-13 ("El Profesor puede forzar `LOCKED` o reiniciar una Unidad; ninguna otra anulación está autorizada" — la trazabilidad de quién ejecuta esta acción es inherente a la propia regla, no un añadido).
**Aggregate afectado:** `AcademyUnit` (a través de su entidad interna `TeacherOverride`).
**Eventos afectados:** `TeacherOverrideApplied` (su payload conceptual ya incluye "autor"; solo se tipifica formalmente, sin cambiar cuándo o por qué se emite).
**Policies afectadas:** ninguna — `TeacherOverridePolicy` ya evalúa exclusivamente el estado de `AcademyUnit` y la acción solicitada, nunca la identidad del actor (esa verificación de autorización ya se asignó correctamente a Application, PND-04); tipificar `TeacherId` no altera su lógica.
**Specifications afectadas:** ninguna.
**Compatibilidad con v1.1:** total — el atributo `autor` ya existía conceptualmente; este cambio únicamente lo formaliza como `TeacherId` (Value Object: identificador único, inmutable, igualdad por valor — mismo patrón exacto que `StudentId`). Ningún comportamiento, estado, transición, evento, Policy, Specification, regla de negocio ni resolución A-01–A-10 se modifica.
**Breaking Change:** NO — v1.1 nunca llegó a implementarse en código (este es el primer sprint que produciría Domain Layer real); no existe ningún consumidor de la forma no tipada que pueda romperse.
**Migración necesaria:** NO (por la misma razón: no hay implementación previa que migrar).
**Justificación:** cumple exactamente, y de forma aislada, el único criterio que esta auditoría reconoce como válido para modificar el Domain Model — "una regla de negocio no puede expresarse correctamente" sin él. No introduce ningún patrón nuevo, no renombra nada por preferencia estética, no amplía el alcance de Academia: es la aplicación literal, por simetría, del mismo patrón que el propio Domain Model v1.1 ya usó para `StudentId`.

**Ningún otro cambio se propone.** Los 23 `PND` restantes se resuelven en Application/Infrastructure/API/Frontend/DevOps sin tocar el Domain Model. CMD-11 no genera una propuesta de cambio (pendiente de clarificación funcional externa a esta auditoría, según se explicó arriba).

---

## Recomendación arquitectónica final

**Nota sobre el módulo referido en el encargo:** el encargo solicita evaluar si el proyecto está listo para "iniciar la implementación del primer módulo funcional (Dashboard)". Dashboard ya fue implementado, auditado y cerrado en sprints previos de este mismo proyecto (`dashboard-technical-audit-2026-07-16.md`, commits ya existentes); el módulo actualmente en la fase de pre-implementación que corresponde a esta cadena de documentos es **Academia**, no Dashboard. Esta recomendación se emite, por tanto, sobre la disposición de **Academia** para avanzar a Sprint 4.3 (Domain Layer), asumiendo que la referencia a "Dashboard" en el encargo es un desajuste de plantilla y no una instrucción literal distinta.

**Recomendación:** el proyecto **no debe iniciar Sprint 4.3 (Domain Layer de Academia) todavía**, por una única razón bloqueante: **CH-01 (tipificación de `TeacherId`) debe cerrarse primero**, dado que es un cambio de Domain Model y el Domain Layer real se construirá directamente sobre esa forma. Es un cierre mínimo y de bajo riesgo (sin breaking change, sin migración, un solo Value Object nuevo por simetría con uno ya existente) — no representa un retraso significativo.

Adicionalmente, antes de Sprint 4.5 (Application Layer), deben resolverse explícitamente los pendientes de Prioridad P1 restantes (PND-03, PND-04) por ser dependencias de integración que, de no resolverse, dejarían dos capacidades ya aprobadas (`MASTERED` y las facultades del Profesor, A-07/A-10) sin poder implementarse correctamente aunque el dominio esté completo.

CMD-11 no bloquea el inicio de Sprint 4.3 ni 4.4 (Domain Layer, Prisma) — su resolución puede diferirse hasta Sprint 4.5 (Application Layer) o posterior, ya que no afecta ningún Aggregate, evento, Policy ni Specification ya aprobados; solo requiere una clarificación funcional externa antes de decidir si genera, eventualmente, un futuro CH-02.

**Domain Model v1.1 no permanece Frozen sin cambios** — se emite el Change Proposal CH-01 arriba. Tras su cierre (que no requiere reabrir ninguna otra sección ni resolución), el Domain Model quedaría en v1.2 con un alcance idéntico en comportamiento a v1.1, y el proyecto quedaría en disposición de iniciar Sprint 4.3.
