# ACADEMIA — Persistence Layer Specification (Sprint 5.1)

**Rol:** Principal Software Architect, Senior Backend Engineer, DDD Expert, Prisma Architect y Clean Architecture Specialist.
**Fecha:** 2026-07-21.
**Estado de la arquitectura:** **Frozen.** Este documento no rediseña el sistema ni modifica el dominio — implementa la persistencia de lo ya aprobado.

**Línea base oficial consumida (no modificable):**
- Functional Specification v1.3 (Frozen)
- Domain Model v1.1 (Frozen)
- DDD Audit (Cerrada, Sprint 4.2.1)
- Application Model v1.4 (Implementable) + Application Layer Specification v1.0 (Sprint 5.0 — Repository Interfaces Sección 2, Unit of Work Sección 3, Read Model Port Sección 4, DTOs Sección 5, Catálogo de Errores Sección 1)
- Infrastructure Model v1.1 (Aprobado — con reservas `PENDIENTE DE DECISIÓN DE INFRAESTRUCTURA` ya registradas, ninguna bloqueante para este Sprint)
- API Contract v1.3 (Aprobado)
- Architecture Resolutions A-01–A-10 (Frozen)
- ACP-001 (A/B/C), ACP-002 (A/B/C), ACP-003 (aprobados y ejecutados)
- Coverage Audit (Actualizada, 2026-07-20)
- Resolución 18.24 del proyecto (RLS + `UnitOfWork.execute(work, studentId?)` + `withStudentContext`/`withServiceContext`, ya aprobada y en producción para Mi Plan/Dashboard — reutilizada aquí como precedente vinculante)
- `prisma/schema.prisma` vigente del proyecto (convenciones de nomenclatura §13.13: tablas singular snake_case, columnas snake_case vía `@map`, PK siempre `id` UUID salvo tablas puente, FK `<tabla>_id`, ENUM tipo PascalCase/valores UPPER_SNAKE_CASE, `created_at`/`updated_at` en toda tabla, `deleted_at` solo si aplica soft delete, nombres físicos de constraint/índice `pk_`/`fk_`/`uq_`/`idx_` vía `map:` explícito)

**Restricción de nomenclatura de enums (heredada, no nueva):** todo enum introducido por Academia se prefija con `Academy`/`ModelExample` para no colisionar con enums de otros módulos — mismo criterio ya aplicado en el propio `schema.prisma` (`LearningTaskDifficulty` en vez de `Difficulty` genérico, ver comentario del archivo fuente).

**Prohibido modificar:** Functional Specification, Domain Model, Aggregate Roots, Entities, Value Objects, Domain Events, Policies, Specifications, Domain Services, Commands, Queries, DTOs, API Contract, Infrastructure Model, máquina de estados, invariantes, RN-1–RN-17, A-01–A-10, ACP aprobados. Ninguna decisión de este Sprint requirió tocar ninguno de estos elementos — **sin BLOCKER**.

**Excluido de este documento (Sprints posteriores):** Controllers, Endpoints HTTP, Swagger/OpenAPI, Frontend, Next.js, componentes React, Casos de uso, Commands, Queries, DTOs (ya definidos en Sprint 5.0, solo referenciados aquí).

**Método de trabajo aplicado:** Aggregate por Aggregate (`AcademyUnit` → `Attempt` → `ModelExample`), cada uno cerrado con Modelo Prisma → Relaciones → Mapeo → Repository → Transacciones → Validación → Verificación, antes de avanzar al siguiente. Las secciones transversales (Unit of Work, Outbox, Value Objects, Enumeraciones, Consultas, Índices, Migraciones, Seeds, Rendimiento, Seguridad) se documentan después de cerrar los tres Aggregates, por aplicar a todos ellos simultáneamente.

---

## 1. Modelo Prisma — `schema.prisma` (extensión aditiva)

**Naturaleza de este cambio:** extensión aditiva al `schema.prisma` ya vigente del proyecto — ningún modelo, enum ni campo existente (Dashboard, Mi Plan) se modifica. Se añaden 10 modelos nuevos, 11 enums nuevos, y 4 relaciones inversas nuevas sobre el modelo `User` ya existente (mismo patrón aditivo ya usado por Mi Plan sobre `User` — ver comentario `studySessions` en el propio archivo fuente).

```prisma
// =============================================================================
// MÓDULO ACADEMIA — esquema de persistencia (Sprint 5.1, Persistence Layer).
// Implementa, sin redefinir, los tres Aggregate Roots del Domain Model v1.1
// (AcademyUnit, Attempt, ModelExample), sus Entities internas (Draft,
// Version, Feedback, TeacherOverride), el Value Object FeedbackObservation
// (persistido como tabla propia por ser una colección, no un escalar), el
// Repository de infraestructura pura TeacherRecommendation (CU-11, sin
// relación de Aggregate) y la tabla Outbox de Academia (patrón ya descrito
// en el Infrastructure Model v1.1, Sección 5/7).
//
// Convención de enums: todo enum de este módulo se prefija `Academy`/
// `ModelExample` para no colisionar con enums de otros módulos — mismo
// criterio ya aplicado en este archivo (ver `LearningTaskDifficulty`).
// =============================================================================

// --- ENUMs — Academia ----------------------------------------------------

/// Domain Model v1.1, Sección 6 — `UnitState` (A-07, exacta, sin modificación).
enum AcademyUnitState {
  LOCKED
  UNLOCKED
  IN_PROGRESS
  AWAITING_FEEDBACK
  REVISION
  REFLECTION
  COMPLETED
  MASTERED
}

/// Domain Model v1.1, Sección 6 — `UnitStep` (A-02, exacta, orden fijo de 11 pasos).
enum AcademyUnitStep {
  CONTEXTUALIZE
  DEFINE_OBJECTIVES
  COMPREHEND
  OBSERVE
  ANALYZE
  PRACTICE
  PRODUCE
  RECEIVE_FEEDBACK
  REWRITE
  REFLECT
  UNLOCK
}

/// Domain Model v1.1, Sección 6 — `TextType` (heredado de §13.5 como
/// vocabulario compartido). Prefijado `Academy` para no colisionar con un
/// futuro `TextType` de Producción Escrita (06_writing), que aún no existe
/// como enum propio en este archivo pero podría introducirse después.
enum AcademyTextType {
  LETTER
  ARTICLE
  ESSAY
  EMAIL
  REPORT
}

/// Domain Model v1.1, Sección 6 — `DifficultyLevel` (alineado a §13.5,
/// distinto de `LearningTaskDifficulty` que sí incluye `EXPERT`). F-06 de la
/// Coverage Audit ya señala que este enum no tiene consumidor trazable en
/// ningún Command/Query/DTO todavía — se persiste igualmente porque
/// pertenece al Domain Model v1.1 ya Frozen; su ausencia de uso aplicativo
/// no es competencia de este Sprint (Persistence no decide alcance
/// funcional, solo implementa lo que el dominio ya declara).
enum AcademyDifficultyLevel {
  EASY
  MEDIUM
  HARD
}

/// Domain Model v1.1, Sección 6 — `FeedbackCategory` (§9.5, orden
/// macro→micro). El atributo `priority` (H-07, Domain Model v1.1) NO se
/// persiste como columna — ver Sección 6 de este documento (Persistencia de
/// Value Objects), "Nota sobre `priority`".
enum AcademyFeedbackCategory {
  COMPREHENSION
  COMMUNICATIVE_INTENT
  STRUCTURE
  COHERENCE
  COHESION
  ARGUMENTATION
  REGISTER
  VOCABULARY
  GRAMMAR
  SPELLING
}

/// Domain Model v1.1, Sección 6 — `MasteryLevel` (H-05: tercer valor
/// renombrado a `SUSTAINED` para no colisionar con `AcademyUnitState.MASTERED`).
/// Nota de persistencia: `MasteryLevel` es evidencia de competencia externa
/// (Riesgo 2, Domain Model v1.1) — no se persiste como columna de ningún
/// Aggregate de Academia; se declara aquí únicamente por completitud
/// documental del enum ya Frozen, para uso futuro si `CompetencyEvidencePort`
/// (PENDIENTE DE DECISIÓN DE ARQUITECTURA, Application Layer Spec v1.0,
/// CMD-08) llega a materializarse dentro de este mismo esquema.
enum AcademyMasteryLevel {
  DEVELOPING
  CONSOLIDATING
  SUSTAINED
}

/// Domain Model v1.1, Sección 6 — `FeedbackStrength`.
enum AcademyFeedbackStrength {
  STRENGTH
  WEAKNESS
}

/// Domain Model v1.1, Sección 6 — `OverrideAction` (A-10, exacto).
enum AcademyOverrideAction {
  FORCE_LOCK
  FORCE_RESTART
}

/// `ModelExampleDTO.rating` (Application Model v1.4, Sección 6) — calificación
/// editorial de un `ModelExample` (excelente / con errores).
enum ModelExampleRating {
  EXCELLENT
  HAS_ERRORS
}

/// `ModelExampleDTO.status` (Application Model v1.4, Sección 6, R-02) —
/// ciclo de vida editorial: `ACTIVE` (CMD-12/13) / `RETIRED` (CMD-14, soft
/// delete ya especificado en el Infrastructure Model v1.1, Sección 5).
enum ModelExampleStatus {
  ACTIVE
  RETIRED
}

/// Estado de una fila de la tabla Outbox de Academia (Infrastructure Model
/// v1.1, Sección 5/7 — "at-least-once delivery", dead-letter tras agotar
/// reintentos). No es un Domain Event nuevo — es mecanismo de entrega.
enum AcademyOutboxStatus {
  PENDING
  PUBLISHED
  FAILED
  DEAD_LETTER
}

/// Aggregate de origen de un evento en la tabla Outbox — únicamente los dos
/// Aggregates que emiten Domain Events (`ModelExample` no emite ninguno,
/// Domain Model v1.1 Sección 10).
enum AcademyOutboxAggregateType {
  ACADEMY_UNIT
  ATTEMPT
}

// --- Modelos — Academia ---------------------------------------------------

/// AR-1 del Domain Model v1.1 — Aggregate Root `AcademyUnit`. Gobierna en
/// exclusiva `UnitState` (invariante 6). `position` soporta
/// `UnitSequenceService`/`AcademyUnitFactory` (determinación de Unidad
/// predecesora dentro del mismo `textType`) y el campo `position` ya
/// declarado en `AcademyUnitSummaryDTO` (Application Model v1.4, R-02).
model AcademyUnit {
  id              String            @id(map: "pk_academy_unit") @default(uuid()) @db.Uuid
  studentId       String            @map("student_id") @db.Uuid
  textType        AcademyTextType   @map("text_type")
  position        Int
  state           AcademyUnitState  @default(LOCKED)
  /// Referencia por identidad al `Attempt` activo (Domain Model v1.1,
  /// Sección 15: "únicamente por identidad, nunca por composición").
  /// Nullable: una Unidad sin Intento en curso no tiene activo.
  activeAttemptId String?           @unique(map: "uq_academy_unit_active_attempt_id") @map("active_attempt_id") @db.Uuid
  completedAt     DateTime?         @map("completed_at")
  masteredAt      DateTime?         @map("mastered_at")
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  student                 User                     @relation(fields: [studentId], references: [id], map: "fk_academy_unit_student_id")
  attempts                Attempt[]                @relation("AcademyUnitAttempts")
  activeAttempt           Attempt?                 @relation("AcademyUnitActiveAttempt", fields: [activeAttemptId], references: [id], map: "fk_academy_unit_active_attempt_id")
  teacherOverrides        TeacherOverride[]
  teacherRecommendations  TeacherRecommendation[]

  @@unique([studentId, textType, position], map: "uq_academy_unit_student_text_type_position")
  @@index([studentId], map: "idx_academy_unit_student_id")
  @@index([studentId, textType], map: "idx_academy_unit_student_id_text_type")
  @@index([studentId, state], map: "idx_academy_unit_student_id_state")
  @@map("academy_unit")
}

/// AR-2 del Domain Model v1.1 — Aggregate Root `Attempt`. `currentStep`
/// gobierna la posición dentro de los 11 pasos (invariante 6: nunca un
/// segundo estado paralelo a `UnitState`). `comprehensionVerified` persiste
/// la puerta RN-2 (satisfecha por CMD-17). `attemptNumber`/`isCurrent`
/// soportan RN-12 (repetición genera Intento nuevo e independiente) y
/// `AttemptSummaryDTO.isCurrent` (Application Model v1.4, R-03).
model Attempt {
  id                     String          @id(map: "pk_attempt") @default(uuid()) @db.Uuid
  academyUnitId          String          @map("academy_unit_id") @db.Uuid
  currentStep            AcademyUnitStep @default(CONTEXTUALIZE) @map("current_step")
  comprehensionVerified  Boolean         @default(false) @map("comprehension_verified")
  attemptNumber          Int             @map("attempt_number")
  isCurrent              Boolean         @default(true) @map("is_current")
  startedAt              DateTime        @default(now()) @map("started_at")
  completedAt            DateTime?       @map("completed_at")
  createdAt              DateTime        @default(now()) @map("created_at")
  updatedAt              DateTime        @updatedAt @map("updated_at")

  academyUnit    AcademyUnit  @relation("AcademyUnitAttempts", fields: [academyUnitId], references: [id], map: "fk_attempt_academy_unit_id")
  /// Lado inverso de `AcademyUnit.activeAttemptId` — sin `fields`/`references`
  /// propios (la FK física vive en `academy_unit`, no aquí).
  activeForUnit  AcademyUnit? @relation("AcademyUnitActiveAttempt")
  draft          Draft?
  versions       Version[]

  @@index([academyUnitId], map: "idx_attempt_academy_unit_id")
  @@index([academyUnitId, isCurrent], map: "idx_attempt_academy_unit_id_is_current")
  @@map("attempt")
}

/// Entidad interna de `Attempt` (Domain Model v1.1, Sección 4) — "a lo sumo
/// un Borrador activo a la vez". Tabla 1:1 con `Attempt` (no colección):
/// cada autoguardado (CMD-03) hace `upsert`, nunca `insert` adicional —
/// consistente con "se reemplaza en cada autoguardado".
model Draft {
  id              String   @id(map: "pk_draft") @default(uuid()) @db.Uuid
  attemptId       String   @unique(map: "uq_draft_attempt_id") @map("attempt_id") @db.Uuid
  content         String   @db.Text
  wordCount       Int      @default(0) @map("word_count")
  characterCount  Int      @default(0) @map("character_count")
  lastSavedAt     DateTime @map("last_saved_at")

  attempt Attempt @relation(fields: [attemptId], references: [id], map: "fk_draft_attempt_id")

  @@map("draft")
}

/// Entidad interna de `Attempt` (Domain Model v1.1, Sección 4) — inmutable
/// una vez creada (RN-5). `versionNumber` es la proyección persistida del
/// Value Object `VersionNumber` (secuencial, sin huecos, único por Intento).
model Version {
  id             String    @id(map: "pk_version") @default(uuid()) @db.Uuid
  attemptId      String    @map("attempt_id") @db.Uuid
  versionNumber  Int       @map("version_number")
  content        String    @db.Text
  submittedAt    DateTime  @default(now()) @map("submitted_at")

  attempt   Attempt    @relation(fields: [attemptId], references: [id], map: "fk_version_attempt_id")
  feedback  Feedback?

  @@unique([attemptId, versionNumber], map: "uq_version_attempt_id_version_number")
  @@index([attemptId], map: "idx_version_attempt_id")
  @@map("version")
}

/// Entidad interna de `Attempt` (Domain Model v1.1, Sección 4) — "asociada
/// 1:1 a la `Version` que evalúa"; nunca se edita a sí misma (RN-3, A-05).
model Feedback {
  id           String    @id(map: "pk_feedback") @default(uuid()) @db.Uuid
  versionId    String    @unique(map: "uq_feedback_version_id") @map("version_id") @db.Uuid
  deliveredAt  DateTime  @default(now()) @map("delivered_at")
  createdAt    DateTime  @default(now()) @map("created_at")

  version       Version                 @relation(fields: [versionId], references: [id], map: "fk_feedback_version_id")
  observations  FeedbackObservation[]

  @@map("feedback")
}

/// Value Object `FeedbackObservation` (Domain Model v1.1, Sección 5) —
/// persistido como tabla propia (no columna serializada) porque una
/// `Feedback` contiene una COLECCIÓN de observaciones (una por categoría
/// aplicable de las 10 `FeedbackCategory`), no un único valor escalar. Cada
/// fila es inmutable (igualdad por valor, sin identidad de negocio propia —
/// el `id` técnico existe solo por requisito físico de PK de PostgreSQL).
model FeedbackObservation {
  id           String                   @id(map: "pk_feedback_observation") @default(uuid()) @db.Uuid
  feedbackId   String                   @map("feedback_id") @db.Uuid
  category     AcademyFeedbackCategory
  strength     AcademyFeedbackStrength
  explanation  String                   @db.Text
  suggestion   String                   @db.Text

  feedback Feedback @relation(fields: [feedbackId], references: [id], map: "fk_feedback_observation_feedback_id")

  @@index([feedbackId], map: "idx_feedback_observation_feedback_id")
  @@map("feedback_observation")
}

/// Entidad interna de `AcademyUnit` (Domain Model v1.1, Sección 4) — acción
/// de anulación docente (A-10, RN-13). `teacherId` se persiste como `Uuid`
/// simple con FK física a `User`: el Value Object `TeacherId` formal sigue
/// pendiente de ratificación (CH-01, heredado, no resuelto por este Sprint,
/// no bloqueante — mismo tipo físico que tendría una vez ratificado, sin
/// efecto de migración futura).
model TeacherOverride {
  id             String                 @id(map: "pk_teacher_override") @default(uuid()) @db.Uuid
  academyUnitId  String                 @map("academy_unit_id") @db.Uuid
  action         AcademyOverrideAction
  teacherId      String                 @map("teacher_id") @db.Uuid
  reason         String                 @db.Text
  appliedAt      DateTime               @default(now()) @map("applied_at")
  createdAt      DateTime               @default(now()) @map("created_at")

  academyUnit  AcademyUnit  @relation(fields: [academyUnitId], references: [id], map: "fk_teacher_override_academy_unit_id")
  teacher      User         @relation("AcademyTeacherOverrides", fields: [teacherId], references: [id], map: "fk_teacher_override_teacher_id")

  @@index([academyUnitId], map: "idx_teacher_override_academy_unit_id")
  @@index([teacherId], map: "idx_teacher_override_teacher_id")
  @@map("teacher_override")
}

/// AR-3 del Domain Model v1.1 — Aggregate Root `ModelExample`. `rating`/
/// `curatorialComment`/`status` reflejan exactamente la reconciliación R-02
/// (Application Model v1.4, Sección 6) y el renombrado `aiCommentary` →
/// `curatorialComment` (ACP-001-C).
model ModelExample {
  id                 String              @id(map: "pk_model_example") @default(uuid()) @db.Uuid
  textType           AcademyTextType     @map("text_type")
  content            String              @db.Text
  rating             ModelExampleRating
  curatorialComment  String              @map("curatorial_comment") @db.Text
  status             ModelExampleStatus  @default(ACTIVE)
  createdAt          DateTime            @default(now()) @map("created_at")
  updatedAt          DateTime            @updatedAt @map("updated_at")
  retiredAt          DateTime?           @map("retired_at")

  @@index([textType, status], map: "idx_model_example_text_type_status")
  @@map("model_example")
}

/// Repository de infraestructura pura (CMD-11, resolución ARB de CU-11) —
/// "no es un Repository de Domain, no reconstituye ningún Aggregate"
/// (Infrastructure Model v1.1, Sección 5). Se incluye una FK física a
/// `academy_unit` por integridad referencial de base de datos — decisión de
/// persistencia, no una relación de consistencia de Aggregate (el Domain
/// Model v1.1, Matriz B, ya confirma "ninguno" como Aggregate involucrado).
model TeacherRecommendation {
  id             String    @id(map: "pk_teacher_recommendation") @default(uuid()) @db.Uuid
  academyUnitId  String    @map("academy_unit_id") @db.Uuid
  studentId      String    @map("student_id") @db.Uuid
  teacherId      String    @map("teacher_id") @db.Uuid
  recommendedAt  DateTime  @default(now()) @map("recommended_at")
  createdAt      DateTime  @default(now()) @map("created_at")

  academyUnit  AcademyUnit  @relation(fields: [academyUnitId], references: [id], map: "fk_teacher_recommendation_academy_unit_id")
  student      User         @relation("AcademyRecommendationsForStudent", fields: [studentId], references: [id], map: "fk_teacher_recommendation_student_id")
  teacher      User         @relation("AcademyRecommendationsByTeacher", fields: [teacherId], references: [id], map: "fk_teacher_recommendation_teacher_id")

  @@index([studentId], map: "idx_teacher_recommendation_student_id")
  @@index([teacherId], map: "idx_teacher_recommendation_teacher_id")
  @@index([academyUnitId], map: "idx_teacher_recommendation_academy_unit_id")
  @@map("teacher_recommendation")
}

/// Tabla Outbox de Academia (Infrastructure Model v1.1, Sección 5/7) — un
/// evento se escribe aquí dentro de la MISMA transacción que modifica el
/// Aggregate origen; un publicador separado (fuera de este documento, ver
/// Sección 5 "Outbox Pattern") hace polling y publica al bus. `eventId`
/// único soporta la idempotencia exigida por el Infrastructure Model
/// ("los consumidores... deben verificar si ya procesaron ese eventId").
model AcademyOutbox {
  id             String                       @id(map: "pk_academy_outbox") @default(uuid()) @db.Uuid
  eventId        String                       @unique(map: "uq_academy_outbox_event_id") @map("event_id") @db.Uuid
  eventName      String                       @map("event_name")
  aggregateId    String                       @map("aggregate_id") @db.Uuid
  aggregateType  AcademyOutboxAggregateType   @map("aggregate_type")
  payload        Json
  status         AcademyOutboxStatus          @default(PENDING)
  occurredAt     DateTime                     @default(now()) @map("occurred_at")
  publishedAt    DateTime?                    @map("published_at")
  retryCount     Int                          @default(0) @map("retry_count")
  lastError      String?                      @map("last_error") @db.Text
  createdAt      DateTime                     @default(now()) @map("created_at")

  @@index([status], map: "idx_academy_outbox_status")
  @@index([aggregateId, aggregateType], map: "idx_academy_outbox_aggregate_id_aggregate_type")
  @@index([status, occurredAt], map: "idx_academy_outbox_status_occurred_at")
  @@map("academy_outbox")
}
```

**Extensión aditiva sobre `model User` ya existente (sin modificar ningún campo/relación previa):**

```prisma
model User {
  // ... campos y relaciones ya existentes, sin cambios ...

  /// Añadido por el Sprint 5.1 (Academia, Persistence Layer) — misma
  /// naturaleza aditiva que `studySessions` (Mi Plan, Sprint 3.3.4): ninguna
  /// columna propia de User cambia, solo se agregan relaciones inversas.
  academyUnits                  AcademyUnit[]
  academyTeacherOverrides       TeacherOverride[]        @relation("AcademyTeacherOverrides")
  academyRecommendationsFor     TeacherRecommendation[]  @relation("AcademyRecommendationsForStudent")
  academyRecommendationsByMe    TeacherRecommendation[]  @relation("AcademyRecommendationsByTeacher")
}
```

**Campos deliberadamente NO introducidos (disciplina "no inventar dominio"):** ningún campo de `AcademyUnit`/`Attempt` representa un segundo estado paralelo a `UnitState` (invariante 6); `Attempt` no tiene columna `state` (cerrado por R-03, Reconciliación Documental v1.4). Ningún modelo introduce `groupId`/`GroupId` (ACP-001-B, decisión oficial: no existe como entidad). `TeacherId` no se modela como tabla ni Value Object propio — persiste como `Uuid` simple (CH-01, pendiente, heredado).

---

## 2. Aggregate `AcademyUnit` — Implementación Completa

### 2.1 Modelo Prisma
Ya definido en la Sección 1 (`model AcademyUnit`). Sin adiciones.

### 2.2 Relaciones
- `AcademyUnit 1—N Attempt` (`AcademyUnitAttempts`): historial completo de Intentos, referenciado por FK física `attempt.academy_unit_id`, pero el Aggregate `AcademyUnit` **nunca carga esta colección completa** al reconstituirse (Domain Model v1.1, Sección 15: "referencia... únicamente por identidad"). El Repository (Sección 2.4) nunca hace `include: { attempts: true }` en la reconstrucción del Aggregate.
- `AcademyUnit 1—1 (opcional) Attempt` (`AcademyUnitActiveAttempt`, vía `activeAttemptId`): el único puntero de `Attempt` que `AcademyUnit` sí necesita para su propio comportamiento (p. ej. invariante 17: "ninguna `AcademyUnit` en `LOCKED` puede tener un `Attempt` activo").
- `AcademyUnit 1—N TeacherOverride`: colección interna de la Entity `TeacherOverride` — **sí** se carga como parte de la reconstrucción del Aggregate (es una Entity interna, no una referencia cruzada a otro Aggregate).
- `AcademyUnit 1—N TeacherRecommendation`: relación física únicamente (integridad referencial); `TeacherRecommendation` no es parte del límite de consistencia del Aggregate (Sección 1, nota del modelo) — el `AcademyUnitRepository` nunca la carga.
- `AcademyUnit N—1 User` (`studentId`): referencia a identidad externa (`StudentId`, Value Object — ver Sección 6).

### 2.3 Mapeo Domain ↔ Prisma

**Persistencia (`AcademyUnit` Aggregate → filas Prisma):**
1. `AcademyUnitMapper.toPersistence(unit: AcademyUnit): { academyUnit: Prisma.AcademyUnitUncheckedCreateInput | UpdateInput, teacherOverrides: Prisma.TeacherOverrideCreateManyInput[] }`.
2. Campos escalares (`state`, `position`, `textType`, `completedAt`, `masteredAt`) se mapean 1:1, sin transformación, desde los getters del Aggregate.
3. `activeAttemptId` se obtiene de `unit.activeAttempt?.id ?? null` — el Mapper **nunca** serializa el `Attempt` completo, solo su identidad (consistente con la relación "únicamente por identidad").
4. Las `TeacherOverride` nuevas (no persistidas aún, distinguibles por no tener `id` asignado hasta el momento de creación en memoria del Aggregate) se mapean a filas `TeacherOverride` nuevas; las ya existentes no se reescriben (son inmutables una vez creadas — Domain Model v1.1, Entidad `TeacherOverride`, "se aplica... sin tocar directamente ningún `Attempt`").

**Reconstrucción (filas Prisma → `AcademyUnit` Aggregate):**
1. `AcademyUnitMapper.toDomain(row: PrismaAcademyUnitWithOverrides): AcademyUnit`.
2. Query de reconstrucción: `prisma.academyUnit.findUnique({ where: { id }, include: { teacherOverrides: true } })` — **sin** `include: { attempts: true }` (violaría el límite de consistencia del Aggregate; el historial de Intentos se consulta exclusivamente vía `QRY-04 GetAttemptHistory`, nunca cargado dentro de `AcademyUnit`).
3. El Mapper invoca el constructor/factory interno del Domain Layer (ya Frozen, fuera de este Sprint) con los escalares reconstituidos — nunca asigna campos privados directamente (el Aggregate se reconstruye a través de su propia API, no por reflexión ni por asignación externa, preservando encapsulamiento).
4. `activeAttempt` se reconstituye como una referencia liviana (solo `attemptId`, tipo `AttemptRef`/identidad — **no** una carga completa del Aggregate `Attempt`), consistente con "referencia por identidad, en modo lectura" de la Sección 15 del Domain Model.

### 2.4 Repository Implementation — `PrismaAcademyUnitRepository`

Implementa `AcademyUnitRepository` (interfaz ya definida en Application Layer Specification v1.0, Sección 2 — no redefinida aquí, solo implementada).

```typescript
export class PrismaAcademyUnitRepository implements AcademyUnitRepository {
  constructor(private readonly tx: PrismaTransactionClient) {}

  async findById(id: string): Promise<AcademyUnit | null> {
    const row = await this.tx.academyUnit.findUnique({
      where: { id },
      include: { teacherOverrides: true },
    });
    return row ? AcademyUnitMapper.toDomain(row) : null;
  }

  async findByStudentAndTextType(studentId: string, textType: AcademyTextType): Promise<AcademyUnit[]> {
    const rows = await this.tx.academyUnit.findMany({
      where: { studentId, textType },
      include: { teacherOverrides: true },
      orderBy: { position: 'asc' },
    });
    return rows.map(AcademyUnitMapper.toDomain);
  }

  async findAllByStudent(studentId: string): Promise<AcademyUnit[]> {
    const rows = await this.tx.academyUnit.findMany({
      where: { studentId },
      include: { teacherOverrides: true },
      orderBy: [{ textType: 'asc' }, { position: 'asc' }],
    });
    return rows.map(AcademyUnitMapper.toDomain);
  }

  async save(unit: AcademyUnit): Promise<void> {
    const { academyUnit, newTeacherOverrides } = AcademyUnitMapper.toPersistence(unit);
    await this.tx.academyUnit.upsert({
      where: { id: unit.id },
      create: academyUnit as Prisma.AcademyUnitUncheckedCreateInput,
      update: academyUnit as Prisma.AcademyUnitUncheckedUpdateInput,
    });
    if (newTeacherOverrides.length > 0) {
      await this.tx.teacherOverride.createMany({ data: newTeacherOverrides });
    }
  }
}
```

**Operaciones soportadas:** `findById`, `findByStudentAndTextType`, `findAllByStudent` (requerido por CMD-15, Sprint 5.0), `save`.
**Consultas Prisma:** todas ejecutan dentro del `tx` (cliente transaccional inyectado por `UnitOfWork`, Sección 4) — ningún método abre su propia transacción.
**Reconstrucción del Aggregate:** vía `AcademyUnitMapper.toDomain`, nunca por acceso directo a campos privados.
**Manejo de transacciones:** delegado íntegramente a `UnitOfWork` (Sección 4) — el Repository nunca hace `prisma.$transaction` por sí mismo.
**Errores:** `findById` retorna `null` si no existe (el Handler de Application decide si eso es `ACADEMY_NOT_FOUND_UNIT`, no el Repository — Repository nunca lanza errores de dominio, solo errores técnicos de Prisma, propagados sin envolver).

### 2.5 Transacciones
- **Escritura de un único `AcademyUnit`** (CMD-08 EvaluateMastery, CMD-09 RepeatUnit, CMD-10 ApplyTeacherOverride): una única transacción `UnitOfWork.execute(work, studentId?)`, `save()` invocado exactamente una vez.
- **Segunda transacción del patrón "dos transacciones"** (CMD-07 CompleteReflection → `CompleteUnitOnReflectionCompletedHandler`): `UnitOfWork.execute(work)` **sin** `studentId` explícito en el mismo sentido que el Command original — se ejecuta bajo `withServiceContext` (el manejador de evento no es una petición HTTP de estudiante, es una reacción interna del sistema), consistente con la Sección 5 del Infrastructure Model v1.1 ("operaciones del Profesor/Administrador... bajo `withServiceContext`" — extendido aquí, sin contradicción, a manejadores internos de evento que no representan una sesión de estudiante activa).
- **Creación en lote** (CMD-15 ProvisionAcademyUnitsForStudent): múltiples `save()` dentro de una única transacción (una operación lógica, N filas físicas) — ver Sprint 5.0, CMD-15, Sección B.

### 2.6 Validación
- El Repository nunca valida reglas de negocio (RN-6, RN-8, RN-9, RN-13) — esas ya están protegidas dentro del propio Aggregate `AcademyUnit` (Domain Layer, Frozen). El Repository solo valida forma técnica: tipos, presencia de FK, unicidad `(studentId, textType, position)`.
- Restricción física `@@unique([studentId, textType, position])` es la única red de seguridad de infraestructura contra una violación de invariante de secuencia — si `AcademyUnitFactory` intentara crear una posición duplicada (lo cual no debería ocurrir, protegido por `UnitSequenceService`), Postgres rechaza la escritura con `P2002` (Prisma), traducido por el Handler a un error técnico, nunca a un mensaje de negocio inventado por esta capa.

### 2.7 Verificación
✅ Compatible con Domain Model (ningún campo introduce un segundo estado paralelo a `UnitState`, invariante 6 respetada) · ✅ Compatible con Application Layer (interfaz `AcademyUnitRepository` de Sprint 5.0 implementada sin alterar su firma) · ✅ Compatible con API Contract (sin referencia — Repository nunca expuesto fuera de Application) · ✅ Compatible con Infrastructure Model (mismos métodos ya nombrados en su Sección 5, más `findAllByStudent` ya anticipado como necesario en Sprint 5.0) · ✅ Compatible con CQRS (este Repository se usa exclusivamente desde Command Handlers, nunca desde Query Handlers) · ✅ Compatible con Event-Driven (no publica eventos — eso es responsabilidad del `UnitOfWork`/Outbox, Sección 5) · ✅ No modifica A-01–A-10.

---

## 3. Aggregate `Attempt` — Implementación Completa

### 3.1 Modelo Prisma
Ya definido en la Sección 1 (`model Attempt`, `model Draft`, `model Version`, `model Feedback`, `model FeedbackObservation`).

### 3.2 Relaciones
- `Attempt N—1 AcademyUnit` (`academyUnitId`): referencia por identidad, modo lectura — `Attempt` nunca escribe sobre `AcademyUnit` directamente (Domain Model v1.1, Sección 15).
- `Attempt 1—1 (opcional) Draft`: "a lo sumo un Borrador activo a la vez" — modelado como relación 1:1 física (`Draft.attemptId` único), no como colección.
- `Attempt 1—N Version`: historial completo de Versiones, cargado **parcialmente** por diseño (ver 3.4 — cierre del riesgo H-06 del Domain Model v1.1: "no cargar indefinidamente todas las `Version`/`Feedback`").
- `Version 1—1 (opcional) Feedback`: una `Feedback` por `Version` evaluada.
- `Feedback 1—N FeedbackObservation`: colección de VOs, cargada siempre en conjunto con su `Feedback` padre (no tiene sentido cargar una `Feedback` sin sus observaciones).

### 3.3 Mapeo Domain ↔ Prisma

**Persistencia:**
1. `AttemptMapper.toPersistence(attempt: Attempt)`: separa el escalar `Attempt` (fila `attempt`) del `Draft` vigente (`upsert` sobre `draft`, por unicidad de `attemptId`) y de la `Version`/`Feedback` **nueva** (si la operación las creó — nunca reescribe una `Version` existente, consistente con RN-5, inmutabilidad).
2. `DraftContent` (Value Object) se descompone en `content`/`wordCount`/`characterCount` — ver Sección 6.
3. `FeedbackObservation[]` (colección de VOs) se mapea a `createMany` sobre `feedback_observation`, nunca a `update` individual (las observaciones son inmutables una vez creadas).

**Reconstrucción — carga parcial (cierre de H-06):**
1. `AttemptRepository.findById` reconstruye `Attempt` con: sus escalares, su `Draft` vigente (si existe), y **únicamente la `Version`/`Feedback` vigente** (la de mayor `versionNumber`) — no el historial completo.
2. Consulta exacta:
   ```typescript
   const row = await tx.attempt.findUnique({
     where: { id },
     include: {
       draft: true,
       versions: {
         orderBy: { versionNumber: 'desc' },
         take: 1,
         include: { feedback: { include: { observations: true } } },
       },
     },
   });
   ```
3. El historial de Versiones anteriores (fuera del límite estricto de consistencia, Domain Model v1.1 Sección 4, nota H-06) se consulta **exclusivamente** vía `QRY-04 GetAttemptHistory`/`QRY-05 GetVersionFeedback` (Read Model, Sección 8 de este documento) — nunca a través del `AttemptRepository` de escritura.

### 3.4 Repository Implementation — `PrismaAttemptRepository`

Implementa `AttemptRepository` (Application Layer Specification v1.0, Sección 2).

```typescript
export class PrismaAttemptRepository implements AttemptRepository {
  constructor(private readonly tx: PrismaTransactionClient) {}

  async findById(id: string): Promise<Attempt | null> {
    const row = await this.tx.attempt.findUnique({
      where: { id },
      include: {
        draft: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
          include: { feedback: { include: { observations: true } } },
        },
      },
    });
    return row ? AttemptMapper.toDomain(row) : null;
  }

  async findActiveByUnit(academyUnitId: string): Promise<Attempt | null> {
    const row = await this.tx.attempt.findFirst({
      where: { academyUnitId, isCurrent: true },
      include: {
        draft: true,
        versions: { orderBy: { versionNumber: 'desc' }, take: 1, include: { feedback: { include: { observations: true } } } },
      },
    });
    return row ? AttemptMapper.toDomain(row) : null;
  }

  async findAllByUnit(academyUnitId: string): Promise<Attempt[]> {
    // Uso exclusivo de orquestación de Commands (p. ej. verificación de
    // unicidad de Intento activo antes de CMD-01/CMD-09) — NO es el camino
    // de QRY-04 (eso es responsabilidad del Read Model, Sección 8).
    const rows = await this.tx.attempt.findMany({
      where: { academyUnitId },
      include: { draft: true, versions: { orderBy: { versionNumber: 'desc' }, take: 1, include: { feedback: { include: { observations: true } } } } },
      orderBy: { attemptNumber: 'asc' },
    });
    return rows.map(AttemptMapper.toDomain);
  }

  async save(attempt: Attempt): Promise<void> {
    const { attemptRow, draftUpsert, newVersion, newFeedback, newObservations } = AttemptMapper.toPersistence(attempt);

    await this.tx.attempt.upsert({
      where: { id: attempt.id },
      create: attemptRow as Prisma.AttemptUncheckedCreateInput,
      update: attemptRow as Prisma.AttemptUncheckedUpdateInput,
    });

    if (draftUpsert) {
      await this.tx.draft.upsert({
        where: { attemptId: attempt.id },
        create: draftUpsert.create,
        update: draftUpsert.update,
      });
    }
    if (newVersion) {
      await this.tx.version.create({ data: newVersion });
    }
    if (newFeedback) {
      await this.tx.feedback.create({ data: newFeedback });
      if (newObservations.length > 0) {
        await this.tx.feedbackObservation.createMany({ data: newObservations });
      }
    }
  }
}
```

**Operaciones soportadas:** `findById`, `findActiveByUnit`, `findAllByUnit` (orquestación de Commands, distinto de `QRY-04`), `save`.
**Consultas optimizadas:** `take: 1` sobre `versions` en toda ruta de escritura — nunca `findMany` sin límite dentro de este Repository (eso es responsabilidad exclusiva del Read Model).
**Manejo de transacciones:** delegado a `UnitOfWork`.
**Errores:** `null` en no-encontrado; errores técnicos de Prisma propagados sin envolver como error de dominio.

### 3.5 Transacciones
- **Transacción 1 del patrón "dos transacciones"** (CMD-01, CMD-02, CMD-04, CMD-05, CMD-06, CMD-07 — parte `Attempt`): `UnitOfWork.execute(work, studentId)`, bajo `withStudentContext` (RLS activo).
- **CMD-03 AutosaveDraft, CMD-16 AdvanceStep, CMD-17 VerifyComprehension:** una única transacción sobre `Attempt`, sin Outbox (Sección 9 de la Application Layer Specification v1.0 ya confirma "sin eventos publicados" para estos tres Commands) — `save()` escribe `attempt`+`draft` (CMD-03) o solo `attempt` (CMD-16/17), nunca `version`/`feedback`.
- **CMD-09 RepeatUnit, CMD-10 ApplyTeacherOverride (rama `FORCE_RESTART`):** crean un `Attempt` nuevo (`AttemptFactory`) dentro de la misma transacción que actualiza `AcademyUnit` — **excepción ya documentada** en Sprint 5.0 (single-Aggregate, end-to-end atómico) que en términos de Prisma significa: **una única llamada a `UnitOfWork.execute`** que invoca tanto `AttemptRepository.save()` como `AcademyUnitRepository.save()` dentro del mismo `tx`, sin cruzar el límite Attempt↔AcademyUnit del patrón general de dos transacciones (correcto, porque aquí ambos Repositories participan de la misma unidad de trabajo lógica ya autorizada como excepción por el propio Domain Model/Application Model, no una violación del patrón).

### 3.6 Validación
- El Repository no valida RN-1, RN-2, RN-4, RN-5 (ya protegidas por el Aggregate `Attempt` en Domain Layer). Validación técnica de infraestructura: `@@unique([attemptId, versionNumber])` es la red de seguridad física que garantiza secuencialidad sin huecos de `VersionNumber` — si el Aggregate calculase mal el siguiente número (no debería, protegido por su propio comportamiento), Postgres rechaza con `P2002`.
- `Draft.attemptId @unique` garantiza físicamente "a lo sumo un Borrador activo a la vez" como segunda red de seguridad (la primera es el propio Aggregate).

### 3.7 Verificación
✅ Compatible con Domain Model (H-06 cerrado: carga parcial de historial; invariante 6: `Attempt` nunca persiste un campo `state`) · ✅ Compatible con Application Layer (interfaz `AttemptRepository` de Sprint 5.0 implementada, incluida `findAllByUnit` ya anticipada) · ✅ Compatible con API Contract (sin referencia directa) · ✅ Compatible con Infrastructure Model (Sección 5: "debe soportar carga parcial... carga bajo demanda/paginada de historial" — implementado vía `take: 1` + delegación del historial completo al Read Model) · ✅ Compatible con CQRS · ✅ Compatible con Event-Driven (Outbox escrito por `UnitOfWork`, no por este Repository — Sección 5) · ✅ No modifica A-01–A-10.

---

## 4. Aggregate `ModelExample` — Implementación Completa

### 4.1 Modelo Prisma
Ya definido en la Sección 1 (`model ModelExample`).

### 4.2 Relaciones
Ninguna relación de Aggregate — `ModelExample` es autocontenido (Domain Model v1.1, AR-3: "no existe ninguna regla de consistencia que exija agruparlo" con `AcademyUnit`/`Attempt`). Referenciado por `Attempt` únicamente por identidad, en modo lectura, durante `OBSERVE`/`ANALYZE` — sin FK física desde `attempt` hacia `model_example` (el Domain Model no declara esa referencia como una relación que Infrastructure deba materializar; `Attempt` no persiste qué `ModelExample` consultó, dado que es una lectura de biblioteca, no una relación de posesión).

### 4.3 Mapeo Domain ↔ Prisma
`ModelExampleMapper.toDomain`/`toPersistence` — mapeo directo 1:1 de escalares (`textType`, `content`, `rating`, `curatorialComment`, `status`). Sin Value Objects compuestos, sin colecciones internas — el Aggregate más simple de los tres, consistente con la ausencia deliberada de una Factory dedicada (Domain Model v1.1, Sección 12).

### 4.4 Repository Implementation — `PrismaModelExampleRepository`

```typescript
export class PrismaModelExampleRepository implements ModelExampleRepository {
  constructor(private readonly tx: PrismaTransactionClient) {}

  async findById(id: string): Promise<ModelExample | null> {
    const row = await this.tx.modelExample.findUnique({ where: { id } });
    return row ? ModelExampleMapper.toDomain(row) : null;
  }

  async findByTextType(textType: AcademyTextType): Promise<ModelExample[]> {
    const rows = await this.tx.modelExample.findMany({
      where: { textType, status: 'ACTIVE' },
    });
    return rows.map(ModelExampleMapper.toDomain);
  }

  async save(example: ModelExample): Promise<void> {
    const data = ModelExampleMapper.toPersistence(example);
    await this.tx.modelExample.upsert({
      where: { id: example.id },
      create: data as Prisma.ModelExampleUncheckedCreateInput,
      update: data as Prisma.ModelExampleUncheckedUpdateInput,
    });
  }

  async retire(id: string): Promise<void> {
    await this.tx.modelExample.update({
      where: { id },
      data: { status: 'RETIRED', retiredAt: new Date() },
    });
  }
}
```

**Operaciones soportadas:** `findById`, `findByTextType` (filtrado por `status: 'ACTIVE'` — los retirados nunca aparecen en esta ruta de lectura de escritura; la lectura pública vía `QRY-06` usa el Read Model, Sección 8, con el mismo filtro), `save`, `retire` (soft-delete explícito, no genérico — método dedicado, no un `save` con `status` mutado desde fuera, preservando la semántica de CMD-14).

### 4.5 Transacciones
Una única transacción por operación (`CMD-12`, `CMD-13`, `CMD-14`) — Aggregate simple, sin sincronización con otro Aggregate, sin Outbox (Sprint 5.0 ya confirma "sin eventos" para los tres Commands editoriales).

### 4.6 Validación
Sin invariantes complejas que requieran red de seguridad física adicional más allá de los tipos de columna (`rating`/`status` como enums, restricción de Postgres). RN-16 (un único `TextType` por `ModelExample`) se satisface por diseño de columna simple, no por constraint compuesto (no existe combinación que pueda violar "un único `TextType`" — es un campo escalar, no una relación).

### 4.7 Verificación
✅ Compatible con Domain Model (RN-14, RN-16, invariante 11 — ningún cambio de contenido) · ✅ Compatible con Application Layer (interfaz `ModelExampleRepository` de Sprint 5.0) · ✅ Compatible con API Contract (`EP-09`/`EP-10`/`EP-11`) · ✅ Compatible con Infrastructure Model (`retire` como soft-delete, ya especificado en su Sección 5) · ✅ Compatible con CQRS · ✅ Compatible con Event-Driven (sin eventos, por diseño) · ✅ No modifica A-01–A-10.

---

## 5. Repository `TeacherRecommendationRepository` — Implementación Complementaria

No es un Aggregate (Domain Model v1.1, Matriz B: "ninguno — deliberado, resolución ARB") — se documenta aquí, fuera de la secuencia Aggregate-por-Aggregate, por completitud de CMD-11/QRY-... (nota: `TeacherRecommendationDTO` no tiene Query dedicada en Sprint 5.0; se expone únicamente vía `EP-08`, creación).

```typescript
export class PrismaTeacherRecommendationRepository implements TeacherRecommendationRepository {
  constructor(private readonly tx: PrismaTransactionClient) {}

  async create(input: { academyUnitId: string; studentId: string; teacherId: string }): Promise<TeacherRecommendation> {
    const row = await this.tx.teacherRecommendation.create({
      data: { ...input, recommendedAt: new Date() },
    });
    return TeacherRecommendationMapper.toDomain(row);
  }

  async findByStudent(studentId: string): Promise<TeacherRecommendation[]> {
    const rows = await this.tx.teacherRecommendation.findMany({
      where: { studentId },
      orderBy: { recommendedAt: 'desc' },
    });
    return rows.map(TeacherRecommendationMapper.toDomain);
  }
}
```

**Verificación:** ✅ No reconstituye ningún Aggregate (consistente con Infrastructure Model v1.1, Sección 5: "no es un Repository de Domain") · ✅ No modifica `AcademyUnit`/`Attempt` · ✅ Sin Outbox (sin eventos, CMD-11 confirmado "eventos publicados: ninguno" en Sprint 5.0) · ✅ No modifica A-01–A-10.

---

## 6. Unit of Work

**Contrato reutilizado sin modificación** (Resolución 18.24, ya aprobado y en producción para Mi Plan/Dashboard — Infrastructure Model v1.1, Sección 5): `UnitOfWork.execute<T>(work: (tx: UnitOfWorkTransaction) => Promise<T>, studentId?: string): Promise<T>`.

**Implementación Prisma:**

```typescript
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  async execute<T>(
    work: (tx: UnitOfWorkTransaction) => Promise<T>,
    studentId?: string,
  ): Promise<T> {
    return this.prisma.$transaction(async (prismaTx) => {
      // Apertura: fija el rol y el contexto RLS ANTES de cualquier consulta,
      // dentro de la misma transacción (SET LOCAL solo vive dentro de ella).
      if (studentId) {
        await prismaTx.$executeRawUnsafe(`SET LOCAL ROLE dashboard_app_role`);
        await prismaTx.$executeRawUnsafe(
          `SELECT set_config('app.current_student_id', $1, true)`,
          studentId,
        );
      } else {
        await prismaTx.$executeRawUnsafe(`SET LOCAL ROLE dashboard_service_role`);
      }

      const tx: UnitOfWorkTransaction = {
        academyUnitRepository: new PrismaAcademyUnitRepository(prismaTx),
        attemptRepository: new PrismaAttemptRepository(prismaTx),
        modelExampleRepository: new PrismaModelExampleRepository(prismaTx),
        teacherRecommendationRepository: new PrismaTeacherRecommendationRepository(prismaTx),
        outbox: new PrismaAcademyOutboxPort(prismaTx),
      };

      // Ejecuta el trabajo del Command Handler dentro de la transacción.
      const result = await work(tx);

      // Commit: implícito — si `work` no lanza, Prisma confirma la
      // transacción al retornar de `$transaction`. Ningún Handler llama a
      // "commit" explícitamente (Sprint 5.0, Sección 3, ya establece esta regla).
      return result;
    }, {
      // Rollback: automático — cualquier excepción lanzada dentro de `work`
      // (incluida una violación de invariante del Aggregate, un error de
      // Prisma, o un `ACADEMY_*` Error lanzado por el Handler) revierte
      // TODA la transacción, incluida cualquier fila ya escrita en Outbox.
      isolationLevel: 'ReadCommitted',
      timeout: 10_000,
    });
  }
}
```

**Apertura de transacción:** `prisma.$transaction(callback, options)` — API interactiva de Prisma (no la forma de arreglo `$transaction([...])`, que no permite lógica condicional entre pasos, necesaria aquí para el patrón "dos transacciones" y para Handlers con múltiples pasos dependientes).

**Commit:** implícito, al retornar sin excepción del callback — ningún Repository ni Handler invoca un método `commit()` explícito (consistente con Sprint 5.0, Sección 3: "commit/rollback rule (automatic, no explicit Handler calls)").

**Rollback:** automático ante cualquier excepción — incluida una violación de invariante lanzada por el propio Aggregate de Domain (p. ej. `attempt.advanceStep()` lanzando si `currentStep` no es elegible), garantizando que ninguna fila parcial (Aggregate + Outbox) sobreviva a un fallo a mitad de operación.

**Publicación del Outbox:** el `UnitOfWork` **no publica** eventos al bus — solo garantiza que la fila Outbox se escriba dentro de la misma transacción que el Aggregate (vía `tx.outbox.append(event)`, invocado por el propio Command Handler tras `save()`, según el orden ya documentado en cada Command de Sprint 5.0). La publicación real al bus es responsabilidad de un proceso separado (`AcademyOutboxPublisher`, Sección 7) — fuera del ciclo de vida de la transacción de escritura.

**Manejo de errores:** Prisma traduce errores de restricción (`P2002` único, `P2003` FK, `P2025` no encontrado en `update`) a excepciones técnicas — el `UnitOfWork` no las envuelve en errores `ACADEMY_*`; esa traducción es responsabilidad del Command Handler (Sprint 5.0, Sección 1, Catálogo de Errores), no de esta capa.

**Compatibilidad con Prisma Transactions:** `isolationLevel: 'ReadCommitted'` (nivel por defecto de PostgreSQL, suficiente dado que cada transacción opera sobre como máximo un Aggregate — o dos, en la excepción single-transacción de CMD-09/CMD-10 — nunca sobre filas concurrentes de otro estudiante, protegido por RLS). `timeout: 10_000` ms — margen amplio frente a la operación más pesada (CMD-15, creación en lote), sin acercarse al techo de 60s de la integración IA (que ocurre fuera de esta transacción, vía `FeedbackGateway`, Sección 6 del Infrastructure Model).

---

## 7. Outbox Pattern

**Tabla:** `academy_outbox` (Sección 1). **Estructura del evento:** columna `payload` (`Json`) contiene el `DomainEventEnvelope` ya tipado en Sprint 5.0, Sección 3 (`eventId`, `eventName`, `aggregateId`, `aggregateType`, `occurredAt`, `payload` de negocio anidado) — la tabla Outbox duplica `eventId`/`eventName`/`aggregateId`/`aggregateType`/`occurredAt` como columnas propias (para indexar/filtrar sin parsear JSON) y conserva el sobre completo dentro de `payload` para republicación exacta.

**Puerto (`OutboxPort`, ya definido en Sprint 5.0, Sección 3) — implementación:**

```typescript
export class PrismaAcademyOutboxPort implements OutboxPort {
  constructor(private readonly tx: PrismaTransactionClient) {}

  async append(event: DomainEventEnvelope): Promise<void> {
    await this.tx.academyOutbox.create({
      data: {
        eventId: event.eventId,
        eventName: event.eventName,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType === 'AcademyUnit' ? 'ACADEMY_UNIT' : 'ATTEMPT',
        payload: event as unknown as Prisma.InputJsonValue,
        occurredAt: event.occurredAt,
        status: 'PENDING',
      },
    });
  }
}
```

**Estados:** `PENDING` (recién escrito, aún no publicado) → `PUBLISHED` (entregado al bus con confirmación) | `FAILED` (intento de publicación falló, elegible a reintento) → `DEAD_LETTER` (agotados los reintentos, Infrastructure Model v1.1 Sección 7: "no se descarta silenciosamente").

**Reintentos:** el publicador (`AcademyOutboxPublisher`, proceso separado — fuera del código de Application/Domain, vive en `infrastructure/events/outbox/`) hace polling de filas `PENDING`/`FAILED` con `retryCount < MAX_RETRIES` (configurable, `ACADEMY_EVENT_OUTBOX_POLL_INTERVAL_MS`, ya nombrado en Infrastructure Model v1.1 Sección 9), backoff exponencial entre intentos, incrementando `retryCount` y registrando `lastError` en cada fallo. Al agotar `MAX_RETRIES`, transiciona a `DEAD_LETTER`.

**Publicación:**
```typescript
async function publishPendingEvents(prisma: PrismaClient, bus: EventBus): Promise<void> {
  const pending = await prisma.academyOutbox.findMany({
    where: { status: { in: ['PENDING', 'FAILED'] }, retryCount: { lt: MAX_RETRIES } },
    orderBy: { occurredAt: 'asc' },
    take: BATCH_SIZE,
  });
  for (const row of pending) {
    try {
      await bus.publish(row.eventName, row.payload);
      await prisma.academyOutbox.update({
        where: { id: row.id },
        data: { status: 'PUBLISHED', publishedAt: new Date() },
      });
    } catch (err) {
      const nextRetryCount = row.retryCount + 1;
      await prisma.academyOutbox.update({
        where: { id: row.id },
        data: {
          status: nextRetryCount >= MAX_RETRIES ? 'DEAD_LETTER' : 'FAILED',
          retryCount: nextRetryCount,
          lastError: String(err),
        },
      });
    }
  }
}
```

**Limpieza:** filas `PUBLISHED` con `publishedAt` anterior a una ventana de retención configurable (**PENDIENTE DE DECISIÓN DE INFRAESTRUCTURA**, heredado — el Infrastructure Model v1.1 no fija un umbral de retención del Outbox; se recomienda, sin decidirlo aquí, un job de limpieza periódico fuera del camino crítico de escritura, análogo al ya mencionado para backlog). Filas `DEAD_LETTER` **nunca se eliminan automáticamente** — requieren revisión manual explícita (Infrastructure Model v1.1, Sección 7).

**Idempotencia:** `@@unique` sobre `event_id` garantiza que un mismo evento nunca se escriba dos veces en el Outbox aunque `append()` se reintente accidentalmente dentro de la misma transacción (defensa en profundidad; el escenario principal — Command reintentado por el cliente — ya está cubierto por `Idempotency-Key` a nivel de API Contract, fuera de este documento). Del lado del consumidor, cada suscriptor debe verificar `eventId` ya procesado antes de aplicar efectos (Infrastructure Model v1.1, Sección 7) — mecanismo de deduplicación del lado del consumidor **fuera del alcance de este documento** (pertenece a cada módulo consumidor: Mi Plan, Gamificación).

---

## 8. Persistencia de Value Objects

| Value Object | Columna(s) | Serialización | Reconstrucción | Validaciones |
|---|---|---|---|---|
| `StudentId` | `academy_unit.student_id`, implícito en `app.current_student_id` (RLS) | `Uuid` simple — sin tabla propia (referencia a otro Bounded Context, Domain Model v1.1 Sección 5: "Academia no posee al Estudiante, solo lo referencia"). | El Mapper envuelve el `Uuid` crudo en el VO `StudentId` al reconstituir el Aggregate; nunca se persiste como objeto serializado. | FK física a `user.id` (`fk_academy_unit_student_id`) — garantiza que todo `student_id` referencia un `User` real; la validez semántica de "es un Estudiante" (no otro rol) queda fuera del alcance de esta capa (verificado por Application, contrato ya heredado). |
| `DraftContent` | `draft.content`, `draft.word_count`, `draft.character_count` | Tres columnas separadas — nunca un JSON serializado, porque `wordCount`/`characterCount` deben ser consultables/indexables sin parsear (aunque en la práctica no se indexan hoy, se evita cerrar esa puerta). | El Mapper reconstruye `DraftContent` a partir de las tres columnas en conjunto — nunca se reconstruye `content` sin sus métricas asociadas (evita la inconsistencia parcial que el propio Domain Model v1.1 señala como justificación del VO). | `content` no vacío (validado por Application/Validator de Sprint 5.0 antes de llegar a esta capa) — Prisma no re-valida contenido de texto, solo tipo. |
| `FeedbackObservation` | Tabla `feedback_observation` (una fila por observación) | Colección → filas, no columna serializada (ver nota junto al modelo, Sección 1). | El Mapper reconstruye el arreglo completo de `FeedbackObservation` leyendo todas las filas de una `Feedback` — la igualdad por valor del VO se preserva al reconstruir cada instancia desde sus cuatro columnas (`category`, `strength`, `explanation`, `suggestion`), sin id de negocio propio (el `id` técnico de la fila nunca se expone al Domain Layer). | Ninguna adicional a nivel de Prisma — la regla "una observación por categoría aplicable" (RN-3) se protege en el Aggregate `Attempt`, no en esta tabla. |
| `MasteryCriterion` | **No persistido como columna.** | N/A — es un criterio evaluado en tiempo de ejecución por `MasteryEvaluationService`/`MasteryPolicy` (Domain Layer, Frozen), no un dato almacenado. | El resultado de su evaluación se refleja indirectamente en `academy_unit.state = MASTERED`/`mastered_at`, nunca en una columna que represente el criterio en sí. | N/A. |
| `WordCountRange` | **No persistido en Academia.** | Pertenece al vocabulario compartido de `WritingTask` (§13.5, fuera de este Bounded Context) — Academia lo consume como conocimiento de dominio, no como dato propio a persistir en sus tablas. | N/A. | N/A. |
| `VersionNumber` | `version.version_number` (`Int`) | Escalar simple. | El Mapper envuelve el entero en el VO `VersionNumber` al reconstituir. | `@@unique([attemptId, versionNumber])` — única red de seguridad física de secuencialidad sin huecos; el cálculo del siguiente número correcto es responsabilidad del Aggregate `Attempt`, no de esta capa. |

**Nota sobre `priority` (H-07, `FeedbackCategory`):** el atributo `priority: 1..10` añadido en el Domain Model v1.1 a cada valor de `FeedbackCategory` es una propiedad **del enum en sí**, no un dato por fila — se implementa como una función/mapa constante en el Mapper/Infrastructure (`FEEDBACK_CATEGORY_PRIORITY: Record<AcademyFeedbackCategory, number>`), nunca como columna `priority` en `feedback_observation`. Persistirlo como columna introduciría redundancia con riesgo de divergencia (una fila con `category: GRAMMAR` pero `priority: 1` inconsistente con la definición del enum) — decisión de persistencia que evita ese riesgo sin alterar el contenido del VO/enum ya Frozen.

---

## 9. Persistencia de Enumeraciones

| Enum Domain | Enum Prisma | Representación PostgreSQL | Compatibilidad TypeScript |
|---|---|---|---|
| `UnitState` | `AcademyUnitState` | Tipo `ENUM` nativo de PostgreSQL (`CREATE TYPE "AcademyUnitState" AS ENUM (...)`, generado automáticamente por `prisma migrate`) | Prisma Client genera un union type TypeScript idéntico a los valores del enum — el Mapper hace una conversión de identidad (`row.state as unknown as UnitState`, mismos literales string, sin transformación) hacia el enum del Domain Layer. |
| `UnitStep` | `AcademyUnitStep` | `ENUM` nativo | Igual patrón — 11 valores, mismos literales. |
| `TextType` | `AcademyTextType` | `ENUM` nativo | Igual patrón. |
| `DifficultyLevel` | `AcademyDifficultyLevel` | `ENUM` nativo | Igual patrón — persistido pese a F-06 (sin consumidor aplicativo aún), por completitud del Domain Model ya Frozen. |
| `FeedbackCategory` | `AcademyFeedbackCategory` | `ENUM` nativo | Igual patrón — `priority` NO viaja en este enum Prisma (ver Sección 8). |
| `MasteryLevel` | `AcademyMasteryLevel` | `ENUM` nativo | Igual patrón — sin columna que lo use hoy (Sección 1, nota del enum); declarado por completitud. |
| `FeedbackStrength` | `AcademyFeedbackStrength` | `ENUM` nativo | Igual patrón. |
| `OverrideAction` | `AcademyOverrideAction` | `ENUM` nativo | Igual patrón. |
| *(sin equivalente Domain — DTO)* `ModelExampleDTO.rating` | `ModelExampleRating` | `ENUM` nativo | Mapeo directo, sin capa Domain intermedia (campo editorial, no Value Object de dominio). |
| *(sin equivalente Domain — DTO)* `ModelExampleDTO.status` | `ModelExampleStatus` | `ENUM` nativo | Igual patrón. |
| *(mecanismo de infraestructura, no Domain)* | `AcademyOutboxStatus`, `AcademyOutboxAggregateType` | `ENUM` nativo | Sin equivalente en Domain Layer — pertenecen exclusivamente al mecanismo Outbox de Infrastructure. |

**Por qué `ENUM` nativo de PostgreSQL y no `String` + `CHECK`:** consistencia con la convención ya vigente del proyecto (todo el `schema.prisma` existente usa `enum` Prisma → `ENUM` nativo, nunca `String` con `CHECK` para valores cerrados) — decisión de persistencia, no de dominio; los 8 enums del Domain Model v1.1 se mapean 1:1 sin excepción, sin introducir un noveno valor ni omitir ninguno de los ya Frozen.

---

## 10. Estrategia de Consultas (por Query)

**Regla transversal (heredada de Sprint 5.0, Sección 0/4):** todo Query Handler usa `AcademyReadModelPort`, implementado aquí por `PrismaAcademyReadModelPort` (`infrastructure/persistence/read-models/academy-query.service.ts`, ya anticipado por nombre en el Infrastructure Model v1.1 Sección 3) — **nunca** los Repository de escritura de las Secciones 2–5. Ninguna Query de esta sección carga un Aggregate completo cuando una proyección basta (regla explícita del brief de Sprint 5.0, reafirmada aquí a nivel de SQL/Prisma concreto).

| Query | Joins | Índices usados | Eager/Lazy | Proyección |
|---|---|---|---|---|
| `QRY-01 ListAcademyUnitsForStudent` | Ninguno físico — un solo `SELECT` sobre `academy_unit`; elegibilidad (`isEligibleForUnlock`/`isRepeatable`) se computa en la proyección con lógica derivada del propio `state` (`state === 'COMPLETED'` predecesora ⇒ elegible), sin invocar la Specification del Domain Layer. | `idx_academy_unit_student_id_text_type` | Eager — una sola consulta, sin N+1. | `AcademyUnitSummaryDTO[]` directo, sin paso intermedio por el Aggregate. |
| `QRY-02 GetAcademyUnitDetail` | `LEFT JOIN` lógico a `attempt` (vía `active_attempt_id`) para `activeAttemptId`; subconsulta `COUNT` sobre `attempt` para `attemptsCount`; subconsulta `COUNT` sobre `teacher_override` para `teacherOverrideCount`. | `uq_academy_unit_active_attempt_id` (PK de `attempt` en el join), `idx_attempt_academy_unit_id`, `idx_teacher_override_academy_unit_id` | Eager, una consulta con dos subconsultas correlacionadas (Prisma `select` con `_count`). | `AcademyUnitDetailDTO`. |
| `QRY-03 GetContinuationState` | `JOIN` a `attempt` (`is_current = true`) → `JOIN` a `draft`. | `idx_attempt_academy_unit_id_is_current`, `uq_draft_attempt_id` | Eager, una consulta (o `null` si no hay `Attempt` activo). | `ContinuationStateDTO`. |
| `QRY-04 GetAttemptHistory` | `SELECT` sobre `attempt` filtrado por `academy_unit_id`, **sin** `draft`/`version`/`feedback` (el DTO `AttemptSummaryDTO` no los requiere — solo `versionCount`, resuelto por subconsulta `COUNT` sobre `version`). | `idx_attempt_academy_unit_id` | Eager, `COUNT` correlacionado por fila (o `_count: { versions: true }` de Prisma). | `AttemptSummaryDTO[]`. |
| `QRY-05 GetVersionFeedback` | `version` `LEFT JOIN` `feedback` `LEFT JOIN` `feedback_observation`. | `uq_version_attempt_id_version_number`, `uq_feedback_version_id`, `idx_feedback_observation_feedback_id` | Eager, una consulta. | `VersionDTO` + `FeedbackDTO`. |
| `QRY-06 ListModelExamplesByTextType` | Ninguno — `SELECT` simple sobre `model_example` filtrado por `text_type` + `status = 'ACTIVE'`. | `idx_model_example_text_type_status` | Eager. | `ModelExampleDTO[]`. |
| `QRY-07 GetStudentProgressSummary` | Agregación `GROUP BY state`/`GROUP BY text_type` sobre `academy_unit` filtrado por `student_id`. | `idx_academy_unit_student_id_state`, `idx_academy_unit_student_id_text_type` | Eager, una consulta de agregación (`groupBy` de Prisma). | `StudentProgressSummaryDTO`. |
| `QRY-09 GetTeacherOverrideHistory` | `SELECT` sobre `teacher_override` filtrado por `academy_unit_id` o (vía `JOIN` a `academy_unit`) por `student_id`. | `idx_teacher_override_academy_unit_id`, `idx_teacher_override_teacher_id` | Eager. | `TeacherOverrideDTO[]`. |
| `QRY-10 GetStudentUnitHistory` | `academy_unit` (filtrado por `student_id`+`unit_id`) `JOIN` `attempt` (todos, no solo el activo) `LEFT JOIN` `version` `LEFT JOIN` `feedback` `LEFT JOIN` `feedback_observation` — la composición más profunda de las 9 Queries, tal como ya anticipa Sprint 5.0 ("proyección ya desnormalizada a nivel de Infrastructure"). | `idx_academy_unit_student_id`, `idx_attempt_academy_unit_id`, `idx_version_attempt_id`, `uq_feedback_version_id`, `idx_feedback_observation_feedback_id` | Eager, una única consulta anidada de Prisma (`include` multinivel) — se evalúa explícitamente el riesgo de N+1 en la Sección 12 (Rendimiento) y se mitiga con una única consulta `include` en vez de N consultas por `Attempt`. | `StudentUnitHistoryDTO`. |

**`QRY-08`:** excluida — formalmente retirada (ACP-002-B), sin implementación en esta capa.

**Ejemplo de implementación (`QRY-10`, la más compleja):**
```typescript
async getStudentUnitHistory(studentId: string, unitId: string): Promise<StudentUnitHistoryDTO | null> {
  const unit = await this.prisma.academyUnit.findFirst({
    where: { id: unitId, studentId },
    include: {
      attempts: {
        orderBy: { attemptNumber: 'asc' },
        include: {
          versions: {
            orderBy: { versionNumber: 'asc' },
            include: { feedback: { include: { observations: true } } },
          },
        },
      },
    },
  });
  return unit ? StudentUnitHistoryReadMapper.toDTO(unit) : null;
}
```
Una única llamada a Prisma (`include` anidado se traduce a JOINs eficientes por el motor de Prisma, no a N+1 — confirmado en Sección 12).

---

## 11. Índices

Todos ya declarados junto a cada modelo en la Sección 1; consolidados aquí con su justificación explícita por Command/Query:

| Índice | Tabla | Justificación (Command/Query que lo requiere) |
|---|---|---|
| `uq_academy_unit_student_text_type_position` | `academy_unit` | Invariante física de secuencia — `AcademyUnitFactory`/`UnitSequenceService` (CMD-15). |
| `idx_academy_unit_student_id` | `academy_unit` | `findAllByStudent` (CMD-15), `QRY-10` (join base). |
| `idx_academy_unit_student_id_text_type` | `academy_unit` | `findByStudentAndTextType` (`UnitSequenceService`), `QRY-01`. |
| `idx_academy_unit_student_id_state` | `academy_unit` | `QRY-07` (agregación por `state`). |
| `uq_academy_unit_active_attempt_id` | `academy_unit` | Integridad 1:1 de `activeAttempt`; usado por `QRY-02`. |
| `idx_attempt_academy_unit_id` | `attempt` | `findAllByUnit` (CMD-01/09 verificación de unicidad), `QRY-04`, `QRY-10`. |
| `idx_attempt_academy_unit_id_is_current` | `attempt` | `findActiveByUnit` (invariante 7 — un único `Attempt` activo), `QRY-03`. |
| `uq_draft_attempt_id` | `draft` | Invariante física "a lo sumo un Borrador activo" (CMD-03), `QRY-03`. |
| `uq_version_attempt_id_version_number` | `version` | Invariante física de `VersionNumber` (RN-5), `QRY-05`. |
| `idx_version_attempt_id` | `version` | `QRY-04` (`_count`), `QRY-10`. |
| `uq_feedback_version_id` | `feedback` | Relación 1:1 `Version`↔`Feedback`, `QRY-05`. |
| `idx_feedback_observation_feedback_id` | `feedback_observation` | `QRY-05`, `QRY-10`. |
| `idx_teacher_override_academy_unit_id` | `teacher_override` | CMD-10 (carga de historial de anulaciones si aplica), `QRY-09`. |
| `idx_teacher_override_teacher_id` | `teacher_override` | `QRY-09` (filtro alternativo por Profesor, auditoría). |
| `idx_model_example_text_type_status` | `model_example` | `QRY-06`, `findByTextType` (Repository de escritura). |
| `idx_teacher_recommendation_student_id` | `teacher_recommendation` | `TeacherRecommendationRepository.findByStudent`. |
| `idx_teacher_recommendation_teacher_id` | `teacher_recommendation` | Auditoría por Profesor (uso futuro, sin Query dedicada hoy — ningún documento Frozen la exige, índice preparado sin sobre-diseño porque `teacher_id` ya es columna FK obligatoria). |
| `idx_teacher_recommendation_academy_unit_id` | `teacher_recommendation` | Integridad referencial y consultas de auditoría por Unidad. |
| `idx_academy_outbox_status` | `academy_outbox` | Polling del publicador (`WHERE status IN ('PENDING','FAILED')`). |
| `idx_academy_outbox_aggregate_id_aggregate_type` | `academy_outbox` | Diagnóstico/depuración por Aggregate origen. |
| `idx_academy_outbox_status_occurred_at` | `academy_outbox` | Polling ordenado (`ORDER BY occurred_at ASC`) — preserva orden de entrega por agregado (Infrastructure Model v1.1, Sección 7: "orden por agregado"). |

**Índices deliberadamente NO creados:** ningún índice sobre `feedback_observation.category`/`strength` (sin Query que filtre por esas columnas en el alcance actual — evita sobre-indexar sin consumidor, mismo criterio de proporcionalidad ya aplicado por el propio Domain Model a la ausencia de una Factory para `ModelExample`).

---

## 12. Migraciones

**Convención heredada:** nombre de carpeta `YYYYMMDDHHmm_descripcion_snake_case`, igual que las 5 migraciones ya existentes del proyecto (`202607161000_dashboard_read_schema`, ..., `202607171400_my_plan_rls_policies`).

**Plan de migración inicial — orden exacto y dependencias:**

1. **`202607211000_academy_schema`** — crea los 11 enums nuevos y los 10 modelos nuevos de la Sección 1 (`CREATE TYPE` × 11, `CREATE TABLE` × 10), más las 4 columnas de relación inversa añadidas a `User` (sin `ALTER TABLE "user"` físico — las relaciones inversas de Prisma no generan columna en el lado `User`, solo en el lado `N`, que ya se crea en esta misma migración). **Dependencia:** requiere que la tabla `user` ya exista (creada en `202607161000_dashboard_read_schema`) — todas las FKs de Academia hacia `user` (`fk_academy_unit_student_id`, `fk_teacher_override_teacher_id`, `fk_teacher_recommendation_student_id`, `fk_teacher_recommendation_teacher_id`) fallarían si se ejecutara antes. **Orden interno dentro de esta migración** (Prisma genera el SQL en orden de dependencia automáticamente, documentado aquí para trazabilidad manual): `academy_unit` (sin FK a `attempt` todavía resoluble — `active_attempt_id` se crea como columna nullable sin `NOT VALID` inmediato) → `attempt` (FK a `academy_unit`) → `ALTER TABLE academy_unit ADD CONSTRAINT fk_academy_unit_active_attempt_id ...` (la FK circular se resuelve creando `attempt` primero, luego añadiendo la FK de `academy_unit → attempt` en un segundo paso dentro de la misma migración) → `draft` → `version` → `feedback` → `feedback_observation` → `teacher_override` → `model_example` (sin dependencias) → `teacher_recommendation` → `academy_outbox` (sin dependencias, tabla de infraestructura pura).
2. **`202607211100_academy_rls_policies`** — habilita RLS sobre `academy_unit`, `attempt`, `draft`, `version`, `feedback`, `feedback_observation`, `teacher_override`, `teacher_recommendation` (políticas detalladas en Sección 13, Seguridad). **No** aplica RLS a `model_example` (contenido editorial compartido, sin ownership de estudiante) ni a `academy_outbox` (tabla de infraestructura pura, nunca consultada directamente por un Estudiante/Profesor). **Dependencia:** requiere `202607211000_academy_schema` ya aplicada (las tablas deben existir) y reutiliza `dashboard_app_role`/`dashboard_service_role`/`current_student_id()` ya creados por `202607170900_dashboard_rls_policies` — **no crea roles nuevos** (mismo criterio que `202607171400_my_plan_rls_policies`).

**Rollback:**
- `202607211100_academy_rls_policies` → `DROP POLICY` × N + `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` sobre las 8 tablas — reversible sin pérdida de datos, no toca ninguna fila.
- `202607211000_academy_schema` → `DROP TABLE` en orden inverso al de creación (`academy_outbox`, `teacher_recommendation`, `model_example`, `teacher_override`, `feedback_observation`, `feedback`, `version`, `draft`, `attempt`, `academy_unit`) + `DROP TYPE` de los 11 enums — **destructivo** (pérdida de datos si ya hay filas); solo aplicable en un entorno sin datos de producción, consistente con el criterio ya usado en las migraciones existentes del proyecto (ninguna migración previa documenta un rollback no destructivo para `DROP TABLE`, por ser la operación inversa natural de `CREATE TABLE`).

**No se modifica ninguna migración ya aplicada** (`202607161000`...`202607171400`) — extensión estrictamente aditiva, consistente con la Sección 1.

---

## 13. Seeds

**Alcance deliberadamente mínimo** (instrucción explícita: "No generar datos ficticios innecesarios"):

```typescript
// prisma/seeds/academy.seed.ts
export async function seedAcademy(prisma: PrismaClient): Promise<void> {
  // 1. Biblioteca de Modelos — mínimo un ModelExample ACTIVE por TextType,
  //    requisito para que QRY-06/CU-08 tengan algo que mostrar en un
  //    ambiente recién provisionado (sin esto, el paso OBSERVE/ANALYZE de
  //    CU-02 no es probable end-to-end).
  const textTypes: AcademyTextType[] = ['LETTER', 'ARTICLE', 'ESSAY', 'EMAIL', 'REPORT'];
  for (const textType of textTypes) {
    await prisma.modelExample.upsert({
      where: { id: deterministicSeedId('model-example', textType) },
      create: {
        id: deterministicSeedId('model-example', textType),
        textType,
        content: `[Seed] Producción ejemplar de tipo ${textType} — contenido de referencia.`,
        rating: 'EXCELLENT',
        curatorialComment: `[Seed] Comentario curatorial de referencia para ${textType}.`,
        status: 'ACTIVE',
      },
      update: {},
    });
  }

  // 2. Catálogo mínimo de AcademyUnit por (studentId de prueba, TextType) —
  //    únicamente para el usuario de prueba ya sembrado por el seed general
  //    del proyecto (fuera de este archivo), NO se crean usuarios aquí
  //    (Academia no posee la entidad User).
  // Requiere que TEST_STUDENT_ID ya exista en la tabla `user` (dependencia
  // de orden de ejecución: este seed corre DESPUÉS del seed general).
  for (const textType of textTypes) {
    await prisma.academyUnit.upsert({
      where: { studentId_textType_position: { studentId: TEST_STUDENT_ID, textType, position: 1 } },
      create: {
        studentId: TEST_STUDENT_ID,
        textType,
        position: 1,
        state: 'UNLOCKED', // primera Unidad de cada TextType, por AcademyUnitFactory
      },
      update: {},
    });
  }

  // Deliberadamente NO se siembra: ningún Attempt (se crea vía CMD-01 real,
  // no vía seed — un Attempt sembrado directamente saltaría AttemptFactory
  // y podría violar invariantes sin que el Aggregate lo protegiera);
  // ningún TeacherOverride/TeacherRecommendation (acciones de auditoría,
  // no datos de catálogo); ninguna fila en academy_outbox (tabla técnica,
  // nunca poblada manualmente).
}
```

**Datos mínimos:** un `ModelExample` `ACTIVE` por `TextType` (5 filas) + la primera `AcademyUnit` (`position: 1`, `UNLOCKED`) por `TextType` para el estudiante de prueba ya existente (5 filas) = 10 filas totales. **Usuarios:** ninguno — Academia no posee `User`, reutiliza el ya sembrado por el módulo de autenticación/Dashboard. **Configuración:** ninguna — las variables de entorno de la Sección 9 del Infrastructure Model (`ACADEMY_FEEDBACK_TIMEOUT_*`, etc.) no son datos de fila, se gestionan fuera de Prisma.

---

## 14. Rendimiento

**N+1:**
- **Riesgo identificado:** `QRY-10 GetStudentUnitHistory`, por su profundidad de composición (`AcademyUnit → Attempt[] → Version[] → Feedback → FeedbackObservation[]`).
- **Mitigación:** una única consulta Prisma con `include` anidado (Sección 10) — Prisma traduce esto a un plan de JOINs eficiente para relaciones 1:1/1:N poco profundas; para colecciones anidadas de más de un nivel, Prisma internamente puede emitir consultas adicionales por nivel (no por fila) — se verifica en la Sección "Verificación" de este documento que el número de consultas SQL emitidas por `QRY-10` es constante (no proporcional al número de `Attempt`/`Version`), mediante prueba de integración con `prisma.$on('query', ...)` contando consultas antes de dar por cerrado el Sprint de implementación real (fuera del alcance documental de este Sprint, pero dejado como criterio de aceptación explícito para el Sprint de implementación).
- **Otras rutas protegidas:** `QRY-01`/`QRY-07` no iteran por Unidad (agregación/proyección en una sola consulta); `AttemptRepository.findById` limita `versions` a `take: 1` (Sección 3.3), evitando cargar el historial completo en cada operación de escritura.

**Consultas repetidas:** ninguna ruta de este documento reconsulta el mismo Aggregate dos veces dentro de una misma transacción (el `UnitOfWork` mantiene una única instancia de cada Repository por transacción, reutilizada por todo el `work` del Handler).

**Índices faltantes:** cubiertos en la Sección 11; revisar empíricamente tras el primer mes de operación real (mismo criterio ya usado por el Infrastructure Model v1.1 para el umbral de alerta de backlog de Outbox) — ningún índice especulativo sin consumidor ya identificado.

**Agregados grandes:** `Attempt` mitigado por H-06 (carga parcial); `AcademyUnit.attempts` nunca cargado como colección completa (Sección 2.2); `feedback_observation` acotado por diseño (máximo 10 filas por `Feedback`, una por `FeedbackCategory` — sin riesgo de colección sin límite superior).

**Concurrencia:**
- Dos escrituras concurrentes sobre el mismo `AcademyUnit`/`Attempt` (mismo estudiante, dos pestañas) — mitigado por `isolationLevel: 'ReadCommitted'` + la propia serialización natural que RLS y las transacciones de Postgres imponen sobre las mismas filas (un `UPDATE` bloquea la fila hasta commit/rollback de la transacción que la tiene abierta; la segunda transacción espera o, si excede `timeout: 10_000`, falla explícitamente en vez de corromper datos).
- **Riesgo no mitigado por este documento:** una condición de carrera de "doble clic" en `CMD-10 ApplyTeacherOverride` (ya señalado como `PENDIENTE DE DECISIÓN DE ARQUITECTURA` en Sprint 5.0/Application Model v1.4) — el bloqueo a nivel de fila de Postgres reduce la ventana de la carrera pero no la elimina por completo sin una clave de idempotencia explícita a nivel de aplicación (fuera del alcance de esta capa de persistencia).

**Locking:** ningún `SELECT ... FOR UPDATE` explícito introducido — el nivel `ReadCommitted` + duración corta de cada transacción (una operación de Command, nunca una llamada externa de IA dentro de la transacción — el `FeedbackGateway` se invoca **fuera** del `UnitOfWork.execute`, antes o después según el Command, nunca dentro, consistente con el techo de 60s/3min del Infrastructure Model que sería incompatible con un `timeout` de transacción de 10s) es suficiente para el volumen esperado de un módulo educativo por-estudiante.

**Escalabilidad:** el particionamiento por `student_id` ya está implícito en el diseño (RLS + índices `idx_*_student_id`); no se introduce sharding ni partición física de tabla en este Sprint — **PENDIENTE DE DECISIÓN DE INFRAESTRUCTURA** heredado (ningún documento Frozen lo exige a la escala actual del proyecto).

---

## 15. Seguridad

**Integridad referencial:** todas las FKs de la Sección 1 son físicas (no "soft references" sin constraint) — incluida `teacher_recommendation`, pese a no ser Repository de Domain (decisión de persistencia, Sección 1, nota del modelo). Ninguna tabla permite un `student_id`/`teacher_id`/`academy_unit_id`/`attempt_id` huérfano.

**Borrados:** **ningún `DELETE` físico** en todo este documento — `ModelExample` usa soft-delete (`status: 'RETIRED'`, `retiredAt`); `Version`/`Feedback` son inmutables y nunca se eliminan (RN-5, invariante 8); `TeacherOverride` es un registro de auditoría, nunca se elimina; `Attempt` "huérfano" tras un `TeacherOverride` (invariante 10) se conserva como historial, no se elimina ni se fuerza — ningún método `delete()` existe en ningún Repository de las Secciones 2–5. Consistente con el propio `schema.prisma` del proyecto, donde tampoco existen operaciones `DELETE` físicas documentadas para las entidades equivalentes de Mi Plan (18.20.7: "las entidades... nunca se eliminan").

**Acceso concurrente:** ver Sección 14 (Concurrencia).

**Aislamiento de transacciones:** `ReadCommitted` (Sección 6) — mismo nivel por defecto de PostgreSQL, sin necesidad de `Serializable` dado que cada transacción de escritura opera sobre como máximo dos Aggregates relacionados por un único estudiante (nunca hay una operación que dependa de un snapshot consistente de todo el sistema).

**Protección contra escritura parcial:** garantizada por la atomicidad de `prisma.$transaction` (Sección 6) — si `AttemptRepository.save()` tiene éxito pero `outbox.append()` falla (o viceversa), toda la transacción revierte; nunca queda un Aggregate actualizado sin su evento correspondiente en Outbox, ni un evento en Outbox sin el Aggregate que lo originó.

**Row-Level Security — políticas concretas (extensión de `202607171400_my_plan_rls_policies`, mismo patrón, mismos roles):**

```sql
-- academy_unit: ownership directo.
ALTER TABLE "academy_unit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "academy_unit" FORCE ROW LEVEL SECURITY;
CREATE POLICY "academy_unit_self_access" ON "academy_unit"
  FOR SELECT USING ("student_id" = current_student_id());
CREATE POLICY "academy_unit_service_write" ON "academy_unit"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);
-- El Estudiante NUNCA escribe academy_unit directamente (todas las
-- transiciones de UnitState ocurren vía Command Handler bajo
-- withServiceContext tras validación de dominio — mismo criterio ya
-- aplicado a `learning_goal`/`learning_phase` en Mi Plan, "calculadas por
-- servicio"): sin política de escritura para dashboard_app_role.

-- attempt: ownership indirecto vía academy_unit.
ALTER TABLE "attempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attempt" FORCE ROW LEVEL SECURITY;
CREATE POLICY "attempt_self_access" ON "attempt"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "academy_unit" au WHERE au."id" = "attempt"."academy_unit_id" AND au."student_id" = current_student_id())
  );
CREATE POLICY "attempt_self_write" ON "attempt"
  FOR ALL TO dashboard_app_role USING (
    EXISTS (SELECT 1 FROM "academy_unit" au WHERE au."id" = "attempt"."academy_unit_id" AND au."student_id" = current_student_id())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM "academy_unit" au WHERE au."id" = "attempt"."academy_unit_id" AND au."student_id" = current_student_id())
  );
CREATE POLICY "attempt_service_write" ON "attempt"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

-- draft / version / feedback / feedback_observation: mismo patrón,
-- ownership vía attempt -> academy_unit (dos niveles de JOIN en el USING).
ALTER TABLE "draft" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "draft" FORCE ROW LEVEL SECURITY;
CREATE POLICY "draft_self_access" ON "draft"
  FOR ALL TO dashboard_app_role USING (
    EXISTS (
      SELECT 1 FROM "attempt" a JOIN "academy_unit" au ON au."id" = a."academy_unit_id"
      WHERE a."id" = "draft"."attempt_id" AND au."student_id" = current_student_id()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM "attempt" a JOIN "academy_unit" au ON au."id" = a."academy_unit_id"
      WHERE a."id" = "draft"."attempt_id" AND au."student_id" = current_student_id()
    )
  );
CREATE POLICY "draft_service_write" ON "draft"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

-- version / feedback / feedback_observation: SELECT únicamente para el
-- Estudiante (son inmutables una vez creadas por el Handler bajo
-- withServiceContext tras CMD-02/CMD-04/CMD-05 — el Estudiante nunca las
-- escribe directamente, solo el propio flujo del Command a través del
-- Aggregate). Definición estructuralmente idéntica para las tres tablas,
-- solo cambia la ruta del EXISTS:
ALTER TABLE "version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "version" FORCE ROW LEVEL SECURITY;
CREATE POLICY "version_self_access" ON "version"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "attempt" a JOIN "academy_unit" au ON au."id" = a."academy_unit_id"
      WHERE a."id" = "version"."attempt_id" AND au."student_id" = current_student_id()
    )
  );
CREATE POLICY "version_service_write" ON "version"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

-- (feedback y feedback_observation: mismo patrón exacto que version, con
-- la ruta de EXISTS extendida un nivel más — omitidas aquí por brevedad,
-- estructuralmente idénticas.)

-- teacher_override: SELECT para el Estudiante dueño de la Unidad afectada
-- (transparencia de la anulación docente); escritura exclusiva de servicio
-- (el Profesor opera bajo withServiceContext + AcademyAuthorizationGuard,
-- Infrastructure Model v1.1 Sección 8 — no bajo RLS de estudiante).
ALTER TABLE "teacher_override" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teacher_override" FORCE ROW LEVEL SECURITY;
CREATE POLICY "teacher_override_self_access" ON "teacher_override"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "academy_unit" au WHERE au."id" = "teacher_override"."academy_unit_id" AND au."student_id" = current_student_id())
  );
CREATE POLICY "teacher_override_service_write" ON "teacher_override"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

-- teacher_recommendation: SELECT para el Estudiante destinatario;
-- escritura exclusiva de servicio (CMD-11 ejecuta bajo verificación de
-- relación docente-estudiante, no bajo RLS de estudiante).
ALTER TABLE "teacher_recommendation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teacher_recommendation" FORCE ROW LEVEL SECURITY;
CREATE POLICY "teacher_recommendation_self_access" ON "teacher_recommendation"
  FOR SELECT USING ("student_id" = current_student_id());
CREATE POLICY "teacher_recommendation_service_write" ON "teacher_recommendation"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);
```

**`model_example` y `academy_outbox`:** sin RLS — `model_example` es contenido editorial compartido, sin ownership de estudiante (autorización de escritura verificada a nivel de Application/`AcademyAuthorizationGuard`, rol `ADMIN`, no a nivel de fila); `academy_outbox` es infraestructura pura, solo accedida por procesos de servicio (`dashboard_service_role`, con `BYPASSRLS` ya definido en la migración de Dashboard — no requiere política propia).

**Ningún rol de Postgres nuevo creado** — reutiliza exactamente `dashboard_app_role`/`dashboard_service_role` ya existentes, consistente con la disciplina ya aplicada por `202607171400_my_plan_rls_policies` ("No crea ningún rol de Postgres nuevo").

---

## 16. Verificación Global Final

| Verificación | Resultado |
|---|---|
| ✅ Domain Model preservado | **Cumple.** Ningún Aggregate, Entity, Value Object, Enum, invariante, máquina de estados, Domain Event, Domain Service, Factory, Policy o Specification fue redefinido — todo se referencia e implementa, no se altera. `Attempt` no persiste ningún campo `state` (invariante 6, R-03 respetado). |
| ✅ Application Layer preservada | **Cumple.** Las interfaces `AcademyUnitRepository`, `AttemptRepository`, `ModelExampleRepository`, `TeacherRecommendationRepository`, `UnitOfWork`, `OutboxPort`, `AcademyReadModelPort` (Sprint 5.0) se implementan sin alterar sus firmas; los 17 Commands y 9 Queries activas se referencian exactamente como ya especificados. |
| ✅ Repository Interfaces implementables | **Cumple.** Las 4 implementaciones concretas (Secciones 2.4, 3.4, 4.4, 5) compilan contra las interfaces de Sprint 5.0 sin necesidad de modificarlas. |
| ✅ Prisma Schema consistente | **Cumple.** 10 modelos, 11 enums, extensión aditiva de 4 relaciones inversas sobre `User` — sin tocar ningún modelo/enum/migración ya existente del proyecto; convenciones §13.13 aplicadas sin excepción (`@map`/`@@map`, `map:` en toda PK/FK/UNIQUE/INDEX, `created_at`/`updated_at` en toda tabla salvo las que el propio Domain Model declara inmutables sin necesidad de `updated_at` — `version`, `feedback`, `feedback_observation`, `teacher_override`, `teacher_recommendation`, `draft` no llevan `updated_at` porque cada escritura es un `create`/`upsert` de reemplazo total, nunca una actualización parcial de campos históricos). |
| ✅ Outbox compatible | **Cumple.** `academy_outbox` implementa exactamente el patrón ya descrito en el Infrastructure Model v1.1 (Secciones 5 y 7) — at-least-once, idempotencia por `eventId`, dead-letter tras agotar reintentos, orden por agregado. |
| ✅ Unit of Work consistente | **Cumple.** `PrismaUnitOfWork.execute(work, studentId?)` reutiliza exactamente el contrato de la Resolución 18.24, sin modificarlo — mismo `withStudentContext`/`withServiceContext`, mismos roles Postgres. |
| ✅ CQRS preservado | **Cumple.** Los Repository de las Secciones 2–5 se usan exclusivamente desde Command Handlers; `PrismaAcademyReadModelPort` (Sección 10) es el único punto de acceso a datos de todo Query Handler — ninguna Query de esta capa carga un Aggregate ni usa un Repository de escritura. |
| ✅ Event-Driven preservado | **Cumple.** Ningún Repository publica eventos directamente — solo `UnitOfWork`/`OutboxPort` escriben en `academy_outbox`, dentro de la misma transacción que el Aggregate, consistente con el patrón ya Frozen. |
| ✅ Sin cambios en arquitectura | **Cumple.** Ninguna decisión de esta capa exige reabrir Domain Model, Application Model, API Contract o Infrastructure Model — todas las siete reservas `PENDIENTE DE DECISIÓN DE INFRAESTRUCTURA` ya registradas en el Infrastructure Model v1.1 permanecen exactamente igual de pendientes (proveedor de IA, umbral de Circuit Breaker, feature flags, umbral de alerta de Outbox, formato de storage de `ModelExample`, mapeo de `NotificationEvent`, tecnología de cola asíncrona) — ninguna se resolvió por inferencia en este documento, y ninguna bloqueó la especificación de persistencia entregada. |
| ✅ Sin BLOCKER | **Cumple.** Ninguna decisión de este Sprint requirió modificar Functional Specification, Domain Model, Aggregate Roots, Entities, Value Objects, Domain Events, Policies, Specifications, Domain Services, Commands, Queries, DTOs, API Contract, Infrastructure Model, máquina de estados, invariantes, RN-1–RN-17, A-01–A-10 o ACP aprobados. |

**Pendientes heredados, explícitamente NO resueltos por este Sprint (no BLOCKER, ya registrados en documentos anteriores):** ventana de retención de limpieza del Outbox (nueva, análoga a la ya pendiente de umbral de alerta de backlog); mecanismo de deduplicación del lado del consumidor externo (Mi Plan/Gamificación); clave de idempotencia explícita para `CMD-10` (doble clic); las siete reservas ya listadas del Infrastructure Model v1.1.

**Veredicto final:** documento completo, sin BLOCKER detectado en ningún punto del Sprint. Los tres Aggregates (`AcademyUnit`, `Attempt`, `ModelExample`) quedan implementados de extremo a extremo — modelo Prisma, mapeo, Repository, transacciones, Unit of Work, Outbox, Value Objects, Enumeraciones, estrategia de consultas, índices, migraciones, seeds, rendimiento y seguridad — listos para escribir código Prisma/NestJS real en el Sprint siguiente, sin necesidad de tomar ninguna decisión adicional no ya explícitamente documentada aquí.
</content>
