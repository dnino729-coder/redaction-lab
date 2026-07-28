# ACADEMIA — Application Layer Implementation Specification v1.0

**Rol:** Principal Software Architect / Senior DDD Engineer / Clean Architecture Expert / Tech Lead, Rédaction Lab.
**Fecha:** 2026-07-20.
**Naturaleza:** especificación de ingeniería completamente implementable de la capa Application del módulo Academia — destinada a generar código NestJS (Clean Architecture, DDD, CQRS, Event-Driven) sin decisiones arquitectónicas adicionales por parte del desarrollador. No es documentación teórica: cada Command, Query, DTO, Validator, Repository, Mapper y Handler queda definido con su firma técnica completa.

**Línea base oficial (Frozen — no modificada por este documento):**
- `academia-functional-specification-v1.3-2026-07-20.md` (Frozen)
- `academia-domain-model-v1.1-2026-07-19.md` (Frozen)
- `academia-ddd-audit-2026-07-19.md` (Cerrada — H-01 a H-11 resueltos en Domain Model v1.1)
- `academia-application-model-v1.4-2026-07-20.md` (Aprobado)
- `academia-infrastructure-model-v1.1-2026-07-19.md` (Aprobado)
- `academia-api-contract-v1.3-2026-07-20.md` (Aprobado)
- `academia-architectural-resolutions-v1.0-2026-07-19.md` (A-01 a A-10, Frozen)
- ACP-001, ACP-002, ACP-003 (aprobados y ejecutados)
- `academia-architecture-coverage-audit-2026-07-19.md` (actualizada, adenda 2026-07-20)

**Confirmación de no-modificación (verificada antes de redactar cada sección):** este documento no redefine ningún Aggregate Root, Entity, Value Object, Domain Event, Policy, Specification, Domain Service, Factory, invariante, regla RN-1–RN-17, resolución A-01–A-10, endpoint del API Contract ni componente del Infrastructure Model. Todo elemento nuevo introducido aquí (nombres de clases, interfaces, firmas de métodos, catálogo de códigos de error) es exclusivamente de la capa Application, sin efecto de comportamiento sobre el dominio ya congelado.

**Alcance de este Sprint (5.0):** Commands, Command Handlers, Queries, Query Handlers, DTOs (referencia técnica, sin redefinir forma), Validators, Repository Interfaces (puertos, sin Prisma), Mappers (Domain ⇄ DTO, sin Prisma), Unit of Work (contrato, sin implementación), catálogo de Errores, Casos de Uso end-to-end.

**Explícitamente fuera de alcance (Sprints posteriores):** Controllers, Prisma, base de datos, SQL, infraestructura, Next.js, Frontend, Swagger/OpenAPI.

---

## 0. Convenciones técnicas transversales

**Lenguaje de especificación:** firmas TypeScript (interfaces, tipos, firmas de método) — no implementación de clases, no decoradores de framework, no cuerpos de método. Es contrato de ingeniería, no código ejecutable de infraestructura.

**Ubicación en el árbol de módulo** (consistente con `project-structure-specification-v1.0-2026-07-20.md` y el árbol ya definido en `academia-infrastructure-model-v1.1-2026-07-19.md`, Sección 3):

```
features/academy/application/
├── commands/         # un archivo por Command: {name}.command.ts + {name}.handler.ts
├── queries/          # un archivo por Query: {name}.query.ts + {name}.handler.ts
├── dto/               # DTOs de entrada/salida (referencia, no redefinición)
├── mappers/           # Domain ⇄ DTO
├── ports/             # Repository interfaces, UnitOfWork, ReadModel port
├── validators/         # un archivo por Command
└── errors/            # catálogo de errores de Application
```

**Patrón CQRS de invocación:** cada Command se invoca vía `CommandBus.execute(command)` → un único `ICommandHandler` registrado 1:1. Cada Query se invoca vía `QueryBus.execute(query)` → un único `IQueryHandler` registrado 1:1. Ningún handler expone más de un método público de ejecución. Consistente con el `CommandBus`/`QueryBus` ya reutilizado del patrón de Mi Plan/Dashboard (Infrastructure Model, Sección 4).

**Nomenclatura:**
- Command: `{Verbo}{Entidad}Command` (p. ej. `StartUnitCommand`).
- Command Handler: `{Verbo}{Entidad}Handler` (p. ej. `StartUnitHandler`), implementa `ICommandHandler<{Verbo}{Entidad}Command, {Verbo}{Entidad}Result>`.
- Query: `{Verbo}{Entidad}Query` (p. ej. `ListAcademyUnitsForStudentQuery`).
- Query Handler: `{Verbo}{Entidad}Handler`, implementa `IQueryHandler<{Verbo}{Entidad}Query, {DTO de salida}>`.
- Validator: `{Verbo}{Entidad}Validator`, expone `validate(input): ValidationResult`.
- DTO de salida: nombre exacto ya reconciliado en `academia-application-model-v1.4-2026-07-20.md`, Sección 6 — **no redefinido aquí**, solo tipado.

**Principio Tell-Don't-Ask (heredado del Domain Model, H-02):** ningún Handler invoca setters ni muta campos de un Aggregate directamente. Todo Handler invoca exclusivamente métodos de comportamiento del Aggregate (`academyUnit.start()`, `attempt.submitProduction(...)`, etc.) y persiste el resultado. Los nombres exactos de esos métodos de comportamiento son responsabilidad del Domain Layer (Sprint 4.3, ya implementado según el Infrastructure Model, Sección 3 — "Ya implementado — Frozen. No se toca en este sprint") y no se redefinen aquí; este documento asume su existencia según la responsabilidad ya descrita en el Domain Model, Sección 3.

**Separación estricta de lectura (CQRS puro, ya establecido en Infrastructure Model Sección 3):** ningún Query Handler reconstituye un Aggregate ni invoca un Repository de escritura. Todos los Query Handlers consumen exclusivamente el puerto `AcademyReadModelPort` (Sección 3.5 de este documento), que Infrastructure implementará contra proyecciones de solo lectura (`academy-query.service.ts`, ya anticipado en el Infrastructure Model), nunca contra los Aggregates.

---

## 1. Catálogo de Errores

Taxonomía estable de códigos de error de la capa Application de Academia. Consume el envoltorio uniforme ya definido en el API Contract (`{code, message, correlationId, details?}`, Sección 11) — este catálogo resuelve, para el módulo Academia únicamente, el vocabulario del campo `code` que el API Contract dejó abierto como **PENDIENTE DE DECISIÓN DE API #4** (dependiente del Error Catalog general del Platform Core, aún no diseñado como documento individual). No se modifica el envoltorio ni ningún código HTTP ya definido en el API Contract — este catálogo solo llena el valor de `code`.

**Categorías (exactamente las seis exigidas):**

### 1.1 — `ValidationError` (error sintáctico/de forma, anterior a tocar el dominio)

| Código | Descripción | Commands afectados |
|---|---|---|
| `ACADEMY_VALIDATION_MISSING_FIELD` | Campo obligatorio ausente en el Input DTO. | Todos |
| `ACADEMY_VALIDATION_INVALID_UUID` | `unitId`/`attemptId`/`studentId`/`modelExampleId`/`versionNumber` con formato inválido. | Todos con identificadores |
| `ACADEMY_VALIDATION_INVALID_TEXT_TYPE` | `textType` fuera del enum de 5 valores (`LETTER, ARTICLE, ESSAY, EMAIL, REPORT`). | CMD-12, CMD-13 |
| `ACADEMY_VALIDATION_CONTENT_EMPTY` | `content` de `Draft`/`Version` vacío. | CMD-02, CMD-03, CMD-05 |
| `ACADEMY_VALIDATION_INVALID_OVERRIDE_ACTION` | `action` fuera del enum `OverrideAction` (`FORCE_LOCK`, `FORCE_RESTART`). | CMD-10 |
| `ACADEMY_VALIDATION_EMPTY_OVERRIDE_REASON` | `reason` vacío o ausente. | CMD-10 |
| `ACADEMY_VALIDATION_EMPTY_COMPREHENSION_RESPONSE` | `comprehensionResponse` vacío. | CMD-17 |
| `ACADEMY_VALIDATION_INVALID_FEEDBACK_CATEGORY` | Una `observation.category` fuera de las 10 `FeedbackCategory`. | CMD-04 |
| `ACADEMY_VALIDATION_MISSING_IDEMPOTENCY_KEY` | Header `Idempotency-Key` ausente en un Command que lo exige. | Todo Command marcado "requiere Idempotency-Key" |

### 1.2 — `BusinessRuleViolation` (rechazo de una regla RN-X, invariante o Policy)

| Código | Descripción | Regla / Policy | Command |
|---|---|---|---|
| `ACADEMY_RULE_UNIT_NOT_UNLOCKED` | La `AcademyUnit` no está en `UNLOCKED`. | RN-6, Invariante 1 | CMD-01 |
| `ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE` | Ya existe un `Attempt` activo para la Unidad. | Invariantes 7, 17 | CMD-01, CMD-09 |
| `ACADEMY_RULE_COMPREHENSION_NOT_VERIFIED` | La puerta de comprensión (`COMPREHEND`) no está satisfecha. | RN-2 | CMD-02 |
| `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND` | `Attempt.currentStep` no es el paso elegible para este Command. | RN-1, invariantes 6/17 | CMD-02, CMD-04, CMD-05, CMD-06, CMD-07, CMD-16, CMD-17 |
| `ACADEMY_RULE_FEEDBACK_POLICY_VIOLATION` | La Retroalimentación entrante no respeta las 10 `FeedbackCategory` o el orden jerárquico. | RN-3, `FeedbackPolicy` | CMD-04 |
| `ACADEMY_RULE_NO_PENDING_VERSION` | No existe `Version` pendiente de Retroalimentación. | Invariante 5 | CMD-04 |
| `ACADEMY_RULE_REVISION_CYCLE_INCOMPLETE` | Ningún ciclo `REVISION` completo antes de `REFLECTION`. | RN-4, `RevisionPolicy` | CMD-06 |
| `ACADEMY_RULE_UNIT_NOT_REPEATABLE` | La `AcademyUnit` no está en `COMPLETED`/`MASTERED`. | `RepeatableSpecification`, `RepetitionPolicy` | CMD-09 |
| `ACADEMY_RULE_OVERRIDE_NOT_VALID_FOR_STATE` | La acción de anulación no es válida para el estado actual. | RN-13, `TeacherOverridePolicy` | CMD-10 |
| `ACADEMY_RULE_MODEL_EXAMPLE_TEXT_TYPE_INVALID` | `textType` no corresponde a un valor válido para `ModelExample`. | RN-16 | CMD-12 |
| `ACADEMY_RULE_MASTERY_NOT_ELIGIBLE` | La Unidad no cumple `MasteryPolicy`/`MasteryEligibleSpecification`. | RN-8 | CMD-08 (rechazo interno, no expuesto) |
| `ACADEMY_RULE_UNLOCK_NOT_ELIGIBLE` | La Unidad predecesora no está `COMPLETED`. | RN-6, `UnlockPolicy` | CMD-07 (evaluación interna de la Unidad siguiente) |

### 1.3 — `NotFoundError`

| Código | Descripción |
|---|---|
| `ACADEMY_NOT_FOUND_UNIT` | `AcademyUnit` inexistente o no pertenece al actor. |
| `ACADEMY_NOT_FOUND_ATTEMPT` | `Attempt` inexistente o no pertenece al actor. |
| `ACADEMY_NOT_FOUND_VERSION` | `Version` inexistente dentro del `Attempt`. |
| `ACADEMY_NOT_FOUND_DRAFT` | No existe `Draft` vigente para el `Attempt`. |
| `ACADEMY_NOT_FOUND_MODEL_EXAMPLE` | `ModelExample` inexistente. |
| `ACADEMY_NOT_FOUND_FEEDBACK` | No existe `Feedback` asociada a la `Version` consultada. |
| `ACADEMY_NOT_FOUND_STUDENT` | Estudiante referenciado inexistente (identidad externa). |
| `ACADEMY_NOT_FOUND_NEXT_UNIT` | No existe Unidad siguiente en la progresión (caso válido, no siempre un error — ver CMD-07). |

### 1.4 — `ConflictError`

| Código | Descripción |
|---|---|
| `ACADEMY_CONFLICT_CONCURRENT_MODIFICATION` | El Aggregate fue modificado por otra operación entre la lectura y la escritura (control de concurrencia optimista). |
| `ACADEMY_CONFLICT_IDEMPOTENCY_KEY_REPLAYED_DIFFERENT_PAYLOAD` | La misma `Idempotency-Key` se reutilizó con un payload distinto dentro de la ventana de 24 horas. |
| `ACADEMY_CONFLICT_MODEL_EXAMPLE_ALREADY_RETIRED` | Se intenta operar sobre un `ModelExample` ya retirado. |

### 1.5 — `UnauthorizedError` (401 — no autenticado)

| Código | Descripción |
|---|---|
| `ACADEMY_UNAUTHORIZED_MISSING_TOKEN` | Ausencia de identidad autenticada resuelta (delegado a Clerk, fuera de Application). |
| `ACADEMY_UNAUTHORIZED_INVALID_TOKEN` | Identidad autenticada no resoluble a un actor válido. |

### 1.6 — `ForbiddenError` (403 — autenticado, sin autorización sobre el recurso)

| Código | Descripción |
|---|---|
| `ACADEMY_FORBIDDEN_NOT_OWNER` | El Estudiante intenta operar sobre una `AcademyUnit`/`Attempt` que no le pertenece (RLS). |
| `ACADEMY_FORBIDDEN_NO_TEACHER_RELATIONSHIP` | El Profesor no tiene relación docente-estudiante establecida (PND-04, verificación delegada a Organización Académica). |
| `ACADEMY_FORBIDDEN_ROLE_NOT_ALLOWED` | El actor no tiene el rol requerido para el Command/Query (p. ej. Profesor invocando `CMD-13`). |
| `ACADEMY_FORBIDDEN_SYSTEM_ONLY_OPERATION` | Un actor humano intenta invocar `CMD-04` (reservado exclusivamente al contrato de sistema con Coach IA). |

**Regla de mapeo hacia HTTP (aplicada por Infrastructure/Presentation, no por Application — referencia informativa, no redefine el API Contract):** `ValidationError → 400/422`, `BusinessRuleViolation → 409/422` (según el caso, ya reflejado endpoint por endpoint en el API Contract v1.3), `NotFoundError → 404`, `ConflictError → 409`, `UnauthorizedError → 401`, `ForbiddenError → 403`.

**Interfaz base:**

```typescript
interface AcademyApplicationError {
  readonly code: string;       // uno de los códigos del catálogo anterior
  readonly category: 'ValidationError' | 'BusinessRuleViolation' | 'NotFoundError' | 'ConflictError' | 'UnauthorizedError' | 'ForbiddenError';
  readonly message: string;
  readonly details?: Record<string, unknown>;
}
```

---

## 2. Repository Interfaces (puertos — sin Prisma)

Firmas exactas de los cuatro Repositories ya nombrados en el Infrastructure Model v1.1, Sección 5 — este documento los formaliza como interfaces TypeScript de la capa Application (`application/ports/`), consistente con la Dependency Inversion ya establecida ("los Repositories son interfaces definidas por Application/Domain, implementadas por Infrastructure").

```typescript
// application/ports/academy-unit.repository.ts
interface AcademyUnitRepository {
  findById(unitId: string): Promise<AcademyUnit | null>;
  findByStudentAndTextType(studentId: string, textType: TextType): Promise<AcademyUnit[]>;
  findAllByStudent(studentId: string, textType?: TextType): Promise<AcademyUnit[]>;
  save(unit: AcademyUnit): Promise<void>;
}

// application/ports/attempt.repository.ts
interface AttemptRepository {
  findById(attemptId: string): Promise<Attempt | null>;
  findActiveByUnit(unitId: string): Promise<Attempt | null>;
  findAllByUnit(unitId: string): Promise<Attempt[]>;          // soporta QRY-04, paginado por Infrastructure (Sección 5, IM v1.1)
  save(attempt: Attempt): Promise<void>;
}

// application/ports/model-example.repository.ts
interface ModelExampleRepository {
  findById(modelExampleId: string): Promise<ModelExample | null>;
  findByTextType(textType: TextType): Promise<ModelExample[]>;
  save(example: ModelExample): Promise<void>;
  retire(modelExampleId: string): Promise<void>;               // soft-delete, mecanismo exacto PENDIENTE DE DECISIÓN DE INFRAESTRUCTURA (Infrastructure Model, Sección 6 CMD-14)
}

// application/ports/teacher-recommendation.repository.ts
// NOTA: no reconstituye ningún Aggregate — registro de infraestructura puro (CMD-11, resolución ARB).
interface TeacherRecommendationRepository {
  create(recommendation: { unitId: string; studentId: string; teacherId: string; recommendedAt: Date }): Promise<{ recommendationId: string }>;
  findByStudent(studentId: string): Promise<TeacherRecommendationRecord[]>;
}
```

**Regla de uso:** estos cuatro puertos son consumidos **exclusivamente** por los Command Handlers (Sección 7). Ningún Query Handler los invoca — ver Sección 4 (`AcademyReadModelPort`).

---

## 3. Unit of Work

Contrato reutilizado del patrón ya aprobado para Mi Plan (Resolución 18.24), sin modificación de su firma, consistente con el Infrastructure Model v1.1 (Sección 5: *"se reutiliza exactamente el contrato ya aprobado... `UnitOfWork.execute(work, studentId?)`"*).

```typescript
// application/ports/unit-of-work.ts
interface UnitOfWork {
  /**
   * Ejecuta `work` dentro de una única transacción atómica.
   * Si `studentId` está presente, la transacción corre bajo `withStudentContext` (RLS activo).
   * Si está ausente, corre bajo `withServiceContext` (Profesor/Administrador/Sistema, con
   * verificación de autorización explícita ya resuelta en el Handler antes de invocar UnitOfWork).
   */
  execute<T>(work: (tx: UnitOfWorkTransaction) => Promise<T>, studentId?: string): Promise<T>;
}

interface UnitOfWorkTransaction {
  readonly academyUnitRepository: AcademyUnitRepository;
  readonly attemptRepository: AttemptRepository;
  readonly modelExampleRepository: ModelExampleRepository;
  readonly teacherRecommendationRepository: TeacherRecommendationRepository;
  readonly outbox: OutboxPort;
}

// application/ports/outbox.port.ts
// Ver Infrastructure Model v1.1, Sección 5/7 — patrón Outbox ya aprobado (IRB).
interface OutboxPort {
  /** Escribe el Domain Event en la tabla Outbox, dentro de la misma transacción que lo originó. */
  append(event: DomainEventEnvelope): Promise<void>;
}

interface DomainEventEnvelope {
  readonly eventId: string;         // UUID v4 — requerido para idempotencia de consumidores (Infrastructure Model, Sección 7)
  readonly eventName: string;       // uno de los 13 Domain Events ya Frozen (Domain Model, Sección 10)
  readonly aggregateId: string;
  readonly aggregateType: 'AcademyUnit' | 'Attempt';
  readonly occurredAt: Date;
  readonly payload: Record<string, unknown>;
}
```

**Regla de commit/rollback:** `execute()` hace commit automático si `work` resuelve sin lanzar excepción; hace rollback automático (incluida cualquier escritura al Outbox dentro de la misma llamada) si `work` lanza cualquier `AcademyApplicationError` o error técnico. Ningún Handler llama a `commit()`/`rollback()` directamente — la responsabilidad es exclusiva de la implementación de `UnitOfWork` (Infrastructure, fuera de alcance de este Sprint).

**Regla de dos transacciones (patrón `AcademyUnit`↔`Attempt`, Application Model v1.4 Sección 7):** ningún Handler abre una transacción que escriba ambos Aggregates. Cada Handler que cruza el límite invoca `UnitOfWork.execute()` **una vez**, exclusivamente sobre el Aggregate de origen; el Aggregate de destino se actualiza en un Handler de evento independiente (Sección 7.18, "Manejadores de eventos de sincronización"), en su propia llamada a `UnitOfWork.execute()`.

---

## 4. Read Model Port (CQRS — lado de lectura)

**Regla obligatoria (explícita en el encargo de este Sprint):** ningún Query Handler accede al dominio (Aggregates, Repositories de escritura) cuando una proyección de solo lectura es suficiente — que es siempre el caso para las nueve Queries activas de Academia. Todas consumen el siguiente puerto único, implementado por Infrastructure contra `read-models/academy-query.service.ts` (ya anticipado en el Infrastructure Model v1.1, Sección 3).

```typescript
// application/ports/academy-read-model.port.ts
interface AcademyReadModelPort {
  listAcademyUnitsForStudent(studentId: string, textType?: TextType): Promise<AcademyUnitSummaryDTO[]>;
  getAcademyUnitDetail(unitId: string): Promise<AcademyUnitDetailDTO | null>;
  getContinuationState(studentId: string): Promise<ContinuationStateDTO | null>;
  getAttemptHistory(unitId: string, pagination: PaginationInput): Promise<PaginatedResult<AttemptSummaryDTO>>;
  getVersionFeedback(attemptId: string, versionNumber: number): Promise<{ version: VersionDTO; feedback: FeedbackDTO | null } | null>;
  listModelExamplesByTextType(textType: TextType, pagination: PaginationInput): Promise<PaginatedResult<ModelExampleDTO>>;
  getStudentProgressSummary(studentId: string): Promise<StudentProgressSummaryDTO>;
  getTeacherOverrideHistory(filter: { unitId?: string; studentId?: string }, pagination: PaginationInput): Promise<PaginatedResult<TeacherOverrideDTO>>;
  getStudentUnitHistory(studentId: string, unitId: string): Promise<StudentUnitHistoryDTO | null>;
}

interface PaginationInput {
  limit: number;   // 1–100, default 20 (consistente con API Contract v1.3, Sección 2)
  offset: number;
}

interface PaginatedResult<T> {
  items: T[];
  meta: { total: number; limit: number; offset: number };
}
```

**Nota de paginación (Sección 14 del Application Model v1.4, aún vigente):** el mecanismo exacto (offset vs. cursor) permanece **PENDIENTE DE DECISIÓN DE ARQUITECTURA** para `QRY-04`/`QRY-06`/`QRY-09`; este puerto expone `PaginationInput`/`PaginatedResult` como contrato mínimo compatible con cualquiera de las dos estrategias — no se resuelve aquí, no se inventa un mecanismo concreto.

---

## 5. DTOs — referencia técnica tipada (forma ya reconciliada, no redefinida)

Cada DTO conserva **exactamente** la forma de campos fijada en `academia-application-model-v1.4-2026-07-20.md`, Sección 6 (definición oficial desde la Reconciliación Documental). Esta sección únicamente añade tipo TypeScript, obligatoriedad y validación de forma — necesarios para generar código — sin agregar, quitar ni renombrar ningún campo.

| DTO | Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|---|
| `AcademyUnitSummaryDTO` | `unitId` | `string` (UUID v4) | Sí | Formato UUID |
| | `studentId` | `string` (UUID v4) | Sí | Formato UUID |
| | `textType` | `TextType` (enum, 5 valores) | Sí | ∈ enum |
| | `state` | `UnitState` (enum, 8 valores) | Sí | ∈ enum |
| | `position` | `number` (entero ≥ 1) | Sí | entero positivo |
| | `unlockedAt` | `Date \| null` | No | ISO-8601 si presente |
| | `completedAt` | `Date \| null` | No | ISO-8601 si presente |
| | `masteredAt` | `Date \| null` | No | ISO-8601 si presente |
| | `attemptCount` | `number` (entero ≥ 0) | Sí | entero ≥ 0 |
| | `eligibleForUnlock` | `boolean \| null` | No | — |
| | `repeatable` | `boolean \| null` | No | — |
| | `isRecommended` | `boolean` | Sí | — |
| `AcademyUnitDetailDTO` | *(extiende `AcademyUnitSummaryDTO`)* | — | — | — |
| | `activeAttemptId` | `string \| null` (UUID v4) | No | Formato UUID si presente |
| | `attemptsCount` | `number` (entero ≥ 0) | Sí | entero ≥ 0 |
| | `teacherOverrideCount` | `number` (entero ≥ 0) | Sí | entero ≥ 0 |
| `AttemptSummaryDTO` | `attemptId` | `string` (UUID v4) | Sí | Formato UUID |
| | `unitId` | `string` (UUID v4) | Sí | Formato UUID |
| | `currentStep` | `UnitStep` (enum, 11 valores) | Sí | ∈ enum |
| | `startedAt` | `Date` | Sí | ISO-8601 |
| | `isCurrent` | `boolean` | Sí | — |
| | `versionCount` | `number` (entero ≥ 0) | Sí | entero ≥ 0 |
| `ContinuationStateDTO` | `unitId` | `string \| null` (UUID v4) | No | Formato UUID si presente |
| | `attemptId` | `string \| null` (UUID v4) | No | Formato UUID si presente |
| | `currentStep` | `UnitStep \| null` | No | ∈ enum si presente |
| | `draftContent` | `{ text: string; wordCount: number; characterCount: number } \| null` | No | — |
| | `lastSavedAt` | `Date \| null` | No | ISO-8601 si presente |
| `DraftDTO` | `attemptId` | `string` (UUID v4) | Sí | Formato UUID |
| | `content` | `string` | Sí | no vacío (`ACADEMY_VALIDATION_CONTENT_EMPTY`) |
| | `wordCount` | `number` (entero ≥ 0) | Sí | entero ≥ 0 |
| | `characterCount` | `number` (entero ≥ 0) | Sí | entero ≥ 0 |
| | `lastSavedAt` | `Date` | Sí | ISO-8601 |
| `VersionDTO` | `versionId` | `string` (UUID v4) | Sí | Formato UUID |
| | `attemptId` | `string` (UUID v4) | Sí | Formato UUID |
| | `versionNumber` | `number` (entero ≥ 1) | Sí | secuencial sin huecos (Value Object `VersionNumber`) |
| | `content` | `string` | Sí | no vacío |
| | `submittedAt` | `Date` | Sí | ISO-8601 |
| | `feedbackStatus` | `'READY' \| 'PROCESSING'` | Sí | ∈ enum literal |
| `FeedbackObservationDTO` | `category` | `FeedbackCategory` (enum, 10 valores) | Sí | ∈ enum |
| | `priority` | `number` (entero 1–10) | Sí | 1 ≤ n ≤ 10 |
| | `strength` | `'STRENGTH' \| 'WEAKNESS'` | Sí | ∈ enum literal |
| | `explanation` | `string` | Sí | no vacío |
| | `suggestion` | `string` | Sí | no vacío |
| `FeedbackDTO` | `feedbackId` | `string` (UUID v4) | Sí | Formato UUID |
| | `versionId` | `string` (UUID v4) | Sí | Formato UUID |
| | `versionNumber` | `number` (entero ≥ 1) | Sí | entero ≥ 1 |
| | `status` | `'READY' \| 'PROCESSING'` | Sí | ∈ enum literal |
| | `observations` | `FeedbackObservationDTO[]` | Sí | ordenado por `priority` ascendente |
| | `deliveredAt` | `Date \| null` | No | ISO-8601 si presente; `null` si `PROCESSING` |
| `ModelExampleDTO` | `modelExampleId` | `string` (UUID v4) | Sí | Formato UUID |
| | `textType` | `TextType` | Sí | ∈ enum |
| | `content` | `string` | Sí | no vacío |
| | `rating` | `'EXCELLENT' \| 'HAS_ERRORS'` | Sí | ∈ enum literal |
| | `curatorialComment` | `string` | Sí | no vacío |
| | `status` | `'ACTIVE' \| 'RETIRED'` | Sí | ∈ enum literal |
| `TeacherOverrideDTO` | `overrideId` | `string` (UUID v4) | Sí | Formato UUID |
| | `unitId` | `string` (UUID v4) | Sí | Formato UUID |
| | `action` | `OverrideAction` (`FORCE_LOCK`\|`FORCE_RESTART`) | Sí | ∈ enum |
| | `reason` | `string` | Sí | no vacío (Regla funcional 8) |
| | `appliedBy` | `string` (identidad Profesor) | Sí | — |
| | `appliedAt` | `Date` | Sí | ISO-8601 |
| `TeacherRecommendationDTO` | `recommendationId` | `string` (UUID v4) | Sí | Formato UUID |
| | `studentId` | `string` (UUID v4) | Sí | Formato UUID |
| | `unitId` | `string` (UUID v4) | Sí | Formato UUID |
| | `recommendedBy` | `string` (identidad Profesor) | Sí | — |
| | `recommendedAt` | `Date` | Sí | ISO-8601 |
| `StudentProgressSummaryDTO` | `studentId` | `string` (UUID v4) | Sí | Formato UUID |
| | `unitsByState` | `Record<UnitState, number>` | Sí | 8 claves, valores enteros ≥ 0 |
| | `unitsByTextType` | `Record<TextType, number>` | Sí | 5 claves, valores enteros ≥ 0 |
| `StudentUnitHistoryDTO` | `studentId` | `string` (UUID v4) | Sí | Formato UUID |
| | `unitId` | `string` (UUID v4) | Sí | Formato UUID |
| | `unitState` | `UnitState` | Sí | ∈ enum |
| | `attemptsCount` | `number` (entero ≥ 0) | Sí | entero ≥ 0 |
| | `attempts` | `Array<AttemptSummaryDTO & { versions: Array<VersionDTO & { feedback: FeedbackDTO \| null }> }>` | Sí | lista vacía si sin intentos (no error) |

---

## 6. Mappers (Domain ⇄ DTO)

Uno por Aggregate, exclusivamente en la dirección `Domain → DTO` (Application nunca construye un Aggregate a partir de un DTO de salida; los Commands construyen sus propios Input DTOs, ver Sección 7). Ningún Mapper contiene lógica de negocio — solo proyección de campos ya calculados por el Aggregate/Entity.

```typescript
// application/mappers/academy-unit.mapper.ts
interface AcademyUnitMapper {
  toSummaryDTO(unit: AcademyUnit, context: { isRecommended: boolean; eligibleForUnlock?: boolean; repeatable?: boolean }): AcademyUnitSummaryDTO;
  toDetailDTO(unit: AcademyUnit, context: { isRecommended: boolean; attemptsCount: number; teacherOverrideCount: number; activeAttemptId: string | null }): AcademyUnitDetailDTO;
}

// application/mappers/attempt.mapper.ts
interface AttemptMapper {
  toSummaryDTO(attempt: Attempt, context: { isCurrent: boolean }): AttemptSummaryDTO;
  toVersionDTO(version: Version): VersionDTO;
  toDraftDTO(draft: Draft): DraftDTO;
  toFeedbackDTO(feedback: Feedback): FeedbackDTO;
}

// application/mappers/model-example.mapper.ts
interface ModelExampleMapper {
  toDTO(example: ModelExample): ModelExampleDTO;
}

// application/mappers/teacher-override.mapper.ts
interface TeacherOverrideMapper {
  toDTO(override: TeacherOverride): TeacherOverrideDTO;
}
```

**Nota:** los campos de contexto que no viven en el Aggregate mismo (`isRecommended`, `eligibleForUnlock`, `repeatable`, `attemptsCount`, `teacherOverrideCount`, `activeAttemptId`, `isCurrent`) se calculan en el Command/Query Handler (mediante Specifications en modo lectura o conteos de Repository) y se inyectan al Mapper como `context` — el Mapper nunca los deriva por sí mismo, para mantenerse sin lógica de negocio ni de consulta.

---

## 7. Commands, Command Handlers y Validators

Formato por Command: **(A)** Especificación del Command, **(B)** Command Handler, **(C)** Validator, **(D)** Checklist de verificación. Cada Command se cierra completamente antes de pasar al siguiente, conforme al método de trabajo exigido.

### CMD-01 — StartUnit

**(A) Especificación**
- **Nombre:** `StartUnitCommand`.
- **Responsabilidad:** iniciar el recorrido de una `AcademyUnit` ya desbloqueada, creando su primer `Attempt`.
- **Input DTO:**
  ```typescript
  interface StartUnitInput {
    unitId: string;      // UUID v4, obligatorio
    studentId: string;   // UUID v4, obligatorio — actor propietario
  }
  ```
- **Output DTO:** `AttemptSummaryDTO` (Sección 5).
- **Aggregate involucrado:** `Attempt` (creación vía `AttemptFactory`); `AcademyUnit` (lectura de precondición; actualización eventual vía manejador de `UnitStarted`).
- **Reglas RN utilizadas:** RN-6 (implícita, vía verificación de estado `UNLOCKED`), invariantes 1, 7, 17.
- **Eventos emitidos:** `UnitStarted`.
- **Validaciones (sintácticas, ver (C)):** `unitId`/`studentId` con formato UUID válido.
- **Excepciones:** `ACADEMY_NOT_FOUND_UNIT`, `ACADEMY_RULE_UNIT_NOT_UNLOCKED`, `ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE`, `ACADEMY_FORBIDDEN_NOT_OWNER`.
- **Idempotencia:** requiere `Idempotency-Key` (delegada a Infrastructure/Presentation); a nivel de Application, protegida naturalmente por la invariante 7/17 — un reintento tras éxito falla con `ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE`, nunca crea un segundo `Attempt`.
- **Autorización:** Estudiante, únicamente sobre su propio `studentId` (RLS).

**(B) Command Handler**
- **Nombre:** `StartUnitHandler implements ICommandHandler<StartUnitCommand, AttemptSummaryDTO>`.
- **Dependencias:** `AcademyUnitRepository`, `AttemptRepository`, `AttemptMapper`, `UnitOfWork`, `AcademyAuthorizationGuard` (verificación de ownership).
- **Flujo completo (orden exacto):**
  1. `AcademyAuthorizationGuard.assertOwnership(actor, input.studentId)` → `ACADEMY_FORBIDDEN_NOT_OWNER` si falla.
  2. `UnitOfWork.execute(async (tx) => { ... }, input.studentId)`.
  3. Dentro de la transacción: `tx.academyUnitRepository.findById(input.unitId)` → `ACADEMY_NOT_FOUND_UNIT` si `null`.
  4. Verificar `unit.state === 'UNLOCKED'` → `ACADEMY_RULE_UNIT_NOT_UNLOCKED` si no.
  5. `tx.attemptRepository.findActiveByUnit(input.unitId)` → `ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE` si no es `null`.
  6. Invocar `AttemptFactory.create(unit, studentId)` → nuevo `Attempt` en paso `CONTEXTUALIZE` (comportamiento ya definido en Domain Layer, Frozen).
  7. `tx.attemptRepository.save(attempt)`.
  8. `tx.outbox.append(envelope('UnitStarted', attempt.id, 'Attempt', { unitId, studentId }))`.
  9. Commit implícito al finalizar `work` sin excepción.
  10. Fuera de la transacción: `AttemptMapper.toSummaryDTO(attempt, { isCurrent: true })` → retorno.
- **Repositorios utilizados:** `AcademyUnitRepository` (lectura), `AttemptRepository` (lectura + escritura).
- **Unit of Work:** una única transacción, `studentId` presente (`withStudentContext`).
- **Publicación de eventos:** `UnitStarted` escrito en Outbox dentro de la misma transacción (paso 8); la transición eventual `UNLOCKED → IN_PROGRESS` de `AcademyUnit` ocurre en un manejador de evento independiente (Sección 7.18).

**(C) Validator**
- **Nombre:** `StartUnitValidator`.
- **Reglas sintácticas (Validation — forma del input, antes de tocar el dominio):** `unitId` y `studentId` deben ser UUID v4 válidos y no vacíos.
- **Reglas semánticas (Business Rule — delegadas al dominio, NO verificadas por el Validator):** `unit.state === 'UNLOCKED'`, ausencia de `Attempt` activo. **Distinción explícita:** el Validator nunca consulta un Repository ni evalúa estado de Aggregate — esas son responsabilidades del Handler/Dominio (pasos 4–5 de (B)), no del Validator.
- **Validaciones cruzadas:** ninguna (Input de un solo nivel, sin campos interdependientes).

**(D) Checklist**
✅ Compatible con Domain Model (invoca `AttemptFactory`/`AcademyUnit` sin redefinir comportamiento) · ✅ Compatible con Functional Specification (CU-01) · ✅ Compatible con API Contract (`EP-01`) · ✅ Compatible con Infrastructure Model (usa `UnitOfWork`/Repositories ya nombrados) · ✅ Compatible con CQRS (Command puro, sin lectura de proyección) · ✅ Compatible con Event-Driven (`UnitStarted` vía Outbox) · ✅ No modifica A-01–A-10.

---

### CMD-02 — SubmitProduction

**(A) Especificación**
- **Nombre:** `SubmitProductionCommand`.
- **Responsabilidad:** registrar la primera producción del estudiante, congelando el `Draft` vigente en una nueva `Version`.
- **Input DTO:**
  ```typescript
  interface SubmitProductionInput {
    attemptId: string;   // UUID v4, obligatorio
    content: string;     // obligatorio, no vacío
  }
  ```
- **Output DTO:** `VersionDTO`, con `feedbackStatus` reflejando el resultado del `FeedbackGateway` (síncrono/asíncrono, Sección 6 del Infrastructure Model — orquestación fuera de este Handler, ver flujo).
- **Aggregate involucrado:** `Attempt`.
- **Reglas RN utilizadas:** RN-2 (puerta de comprensión), RN-5 (inmutabilidad de `Version`).
- **Eventos emitidos:** `ProductionSubmitted`, `FeedbackRequested`.
- **Validaciones:** `attemptId` UUID válido; `content` no vacío; longitud dentro de `WordCountRange` (Value Object, verificado por el propio Aggregate al invocar su comportamiento).
- **Excepciones:** `ACADEMY_NOT_FOUND_ATTEMPT`, `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND` (no está en `PRODUCE`), `ACADEMY_RULE_COMPREHENSION_NOT_VERIFIED`, `ACADEMY_VALIDATION_CONTENT_EMPTY`, `ACADEMY_FORBIDDEN_NOT_OWNER`.
- **Idempotencia:** requiere `Idempotency-Key` (Presentation/Infrastructure); a nivel de Application, un reintento post-éxito falla con `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND` (el `Attempt` ya avanzó a `RECEIVE_FEEDBACK`).
- **Autorización:** Estudiante, propietario del `Attempt`.

**(B) Command Handler**
- **Nombre:** `SubmitProductionHandler implements ICommandHandler<SubmitProductionCommand, VersionDTO>`.
- **Dependencias:** `AttemptRepository`, `AcademyUnitRepository` (solo para verificación de ownership indirecta si aplica), `AttemptMapper`, `UnitOfWork`, `FeedbackGatewayPort` (puerto de Infrastructure — invocado, no implementado aquí), `AcademyAuthorizationGuard`.
- **Flujo completo (orden exacto):**
  1. `AcademyAuthorizationGuard.assertAttemptOwnership(actor, input.attemptId)`.
  2. `UnitOfWork.execute(async (tx) => { ... }, actor.studentId)`.
  3. `tx.attemptRepository.findById(input.attemptId)` → `ACADEMY_NOT_FOUND_ATTEMPT` si `null`.
  4. Verificar `attempt.currentStep === 'PRODUCE'` → `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND` si no.
  5. Verificar puerta de comprensión satisfecha (estado interno ya establecido por `CMD-17`) → `ACADEMY_RULE_COMPREHENSION_NOT_VERIFIED` si no.
  6. Invocar comportamiento `attempt.submitProduction(content)` → congela `Draft` en nueva `Version`, avanza a `RECEIVE_FEEDBACK`, produce `ProductionSubmitted` + `FeedbackRequested` (comportamiento ya definido en Domain Layer).
  7. `tx.attemptRepository.save(attempt)`.
  8. `tx.outbox.append(envelope('ProductionSubmitted', ...))`, `tx.outbox.append(envelope('FeedbackRequested', ...))`.
  9. Commit.
  10. **Fuera de la transacción de escritura del `Attempt`** (ver Sección 0, principio Tell-Don't-Ask + patrón de dos transacciones): invocar `FeedbackGatewayPort.requestFeedback(version)` — si responde dentro de la ventana objetivo (60s), continuar en el mismo flujo síncrono registrando `CMD-04` internamente (ver CMD-04); si no, retornar de inmediato con `feedbackStatus: 'PROCESSING'`, dejando que el worker asíncrono (Infrastructure, fuera de alcance) invoque `CMD-04` más tarde.
  11. `AttemptMapper.toVersionDTO(version)` → retorno, con `feedbackStatus` según el resultado del paso 10.
- **Repositorios utilizados:** `AttemptRepository`.
- **Unit of Work:** una transacción para el `Attempt` (pasos 3–9); la llamada al `FeedbackGatewayPort` (paso 10) ocurre **fuera** de esa transacción, consistente con la Sección 7 del Application Model v1.4 ("ningún Command escribe ambos Aggregates en una única transacción compartida" — aquí, análogamente, ninguna transacción de escritura permanece abierta durante una llamada de red externa).
- **Publicación de eventos:** `ProductionSubmitted`, `FeedbackRequested` vía Outbox, dentro de la transacción del paso 2.

**(C) Validator**
- **Nombre:** `SubmitProductionValidator`.
- **Reglas sintácticas:** `attemptId` UUID válido; `content` string no vacío, longitud máxima de payload (protección de transporte, no de negocio).
- **Reglas semánticas (Business Rule, delegadas al Handler/Dominio):** `currentStep === 'PRODUCE'`, puerta de comprensión satisfecha, `content` dentro de `WordCountRange` (esta última la verifica el propio Aggregate al invocar `submitProduction`, no el Validator — el Validator solo descarta vacío/formato, nunca un rango de negocio).
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Compatible con Domain Model · ✅ Compatible con Functional Specification (CU-03) · ✅ Compatible con API Contract (`EP-03`) · ✅ Compatible con Infrastructure Model (`FeedbackGateway`, Sección 6) · ✅ Compatible con CQRS · ✅ Compatible con Event-Driven (`ProductionSubmitted`/`FeedbackRequested` vía Outbox) · ✅ No modifica A-01–A-10.

---

### CMD-03 — AutosaveDraft

**(A) Especificación**
- **Nombre:** `AutosaveDraftCommand`.
- **Responsabilidad:** reemplazar el contenido en curso del `Draft` durante los pasos `PRODUCE`/`REWRITE`, soportando A-06.
- **Input DTO:** `interface AutosaveDraftInput { attemptId: string; content: string; }`.
- **Output DTO:** `DraftDTO`.
- **Aggregate involucrado:** `Attempt`.
- **Reglas RN utilizadas:** RN-15 (continuidad persistente).
- **Eventos emitidos:** ninguno (mismo criterio de granularidad ya fijado en el Application Model v1.4).
- **Validaciones:** `attemptId` UUID válido; `content` string (puede ser vacío durante edición, a diferencia de `SubmitProduction` — el vaciado de un borrador en curso no es un error).
- **Excepciones:** `ACADEMY_NOT_FOUND_ATTEMPT`, `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND` (no está en `PRODUCE`/`REWRITE`), `ACADEMY_FORBIDDEN_NOT_OWNER`.
- **Idempotencia:** natural — reemplazo total de `DraftContent`, mismo resultado en reintentos con el mismo contenido.
- **Autorización:** Estudiante, propietario del `Attempt`.

**(B) Command Handler**
- **Nombre:** `AutosaveDraftHandler implements ICommandHandler<AutosaveDraftCommand, DraftDTO>`.
- **Dependencias:** `AttemptRepository`, `AttemptMapper`, `UnitOfWork`, `AcademyAuthorizationGuard`.
- **Flujo completo:** 1) `assertAttemptOwnership`. 2) `UnitOfWork.execute(..., studentId)`. 3) `findById(attemptId)` → `ACADEMY_NOT_FOUND_ATTEMPT`. 4) verificar `currentStep ∈ {PRODUCE, REWRITE}` → `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND`. 5) `attempt.autosaveDraft(content)` (comportamiento Domain, reemplaza `DraftContent` + `autosavedAt`). 6) `tx.attemptRepository.save(attempt)`. 7) commit (sin escritura a Outbox — ningún evento). 8) `AttemptMapper.toDraftDTO(draft)` → retorno.
- **Repositorios:** `AttemptRepository`.
- **Unit of Work:** una transacción, sin Outbox.
- **Publicación de eventos:** ninguna.

**(C) Validator**
- **Reglas sintácticas:** `attemptId` UUID válido; `content` de tipo string (puede ser cadena vacía).
- **Reglas semánticas (Handler/Dominio):** `currentStep ∈ {PRODUCE, REWRITE}`.
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model · ✅ Functional Specification (A-06) · ✅ API Contract (`EP-02`) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven (sin evento, por diseño) · ✅ No modifica A-01–A-10.

---

### CMD-04 — RecordFeedbackDelivered

**(A) Especificación**
- **Nombre:** `RecordFeedbackDeliveredCommand`.
- **Responsabilidad:** registrar la Retroalimentación recibida del contrato Customer-Supplier con Coach IA para una `Version` pendiente.
- **Input DTO:**
  ```typescript
  interface RecordFeedbackDeliveredInput {
    attemptId: string;
    versionNumber: number;
    observations: Array<{ category: FeedbackCategory; strength: 'STRENGTH' | 'WEAKNESS'; explanation: string; suggestion: string }>;
  }
  ```
- **Output DTO:** `FeedbackDTO`.
- **Aggregate involucrado:** `Attempt`.
- **Reglas RN utilizadas:** RN-3, `FeedbackPolicy`.
- **Eventos emitidos:** `FeedbackDelivered`.
- **Validaciones:** `observations` no vacío; cada `category` ∈ `FeedbackCategory` (`ACADEMY_VALIDATION_INVALID_FEEDBACK_CATEGORY` si no).
- **Excepciones:** `ACADEMY_NOT_FOUND_ATTEMPT`, `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND` (no está en `RECEIVE_FEEDBACK`), `ACADEMY_RULE_NO_PENDING_VERSION`, `ACADEMY_RULE_FEEDBACK_POLICY_VIOLATION`, `ACADEMY_FORBIDDEN_SYSTEM_ONLY_OPERATION` (si el actor no es `AI_SERVICE`/`SYSTEM`).
- **Idempotencia:** **obligatoria y no delegable** — clave de deduplicación `(attemptId, versionNumber)` (Value Object `VersionNumber` ya existente). Mecanismo exacto de almacenamiento de la clave: **PENDIENTE DE DECISIÓN DE ARQUITECTURA** (heredado del Application Model v1.4, sin cambio); el Handler debe verificar, antes de aplicar, si ya existe `Feedback` para esa `(attemptId, versionNumber)` y, si existe, retornar el resultado ya registrado sin duplicar ni reavanzar el paso.
- **Autorización:** exclusivamente `AI_SERVICE`/`SYSTEM` (nunca un actor humano) — `ACADEMY_FORBIDDEN_SYSTEM_ONLY_OPERATION` en cualquier otro caso.

**(B) Command Handler**
- **Nombre:** `RecordFeedbackDeliveredHandler implements ICommandHandler<RecordFeedbackDeliveredCommand, FeedbackDTO>`.
- **Dependencias:** `AttemptRepository`, `AttemptMapper`, `UnitOfWork`, `FeedbackPolicyEvaluator` (invocación del comportamiento ya definido en Domain).
- **Flujo completo:** 1) verificar `actor.role === 'AI_SERVICE' | 'SYSTEM'` → `ACADEMY_FORBIDDEN_SYSTEM_ONLY_OPERATION`. 2) `UnitOfWork.execute(..., studentId: undefined)` (contexto `withServiceContext`). 3) `findById(attemptId)` → `ACADEMY_NOT_FOUND_ATTEMPT`. 4) verificar idempotencia: si ya existe `Feedback` para `(attemptId, versionNumber)`, retornar el DTO ya existente sin ejecutar pasos 5–8. 5) verificar `currentStep === 'RECEIVE_FEEDBACK'` → `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND`. 6) verificar existencia de `Version` pendiente → `ACADEMY_RULE_NO_PENDING_VERSION`. 7) invocar `attempt.recordFeedback(observations)` — el propio Aggregate evalúa `FeedbackPolicy` internamente (RN-3) y lanza el equivalente a `ACADEMY_RULE_FEEDBACK_POLICY_VIOLATION` si no se cumple; si se cumple, registra `Feedback`, avanza a `REWRITE`, produce `FeedbackDelivered`. 8) `tx.attemptRepository.save(attempt)`. 9) `tx.outbox.append(envelope('FeedbackDelivered', ...))`. 10) commit. 11) `AttemptMapper.toFeedbackDTO(feedback)` → retorno.
- **Repositorios:** `AttemptRepository`.
- **Unit of Work:** una transacción, `withServiceContext`.
- **Publicación de eventos:** `FeedbackDelivered` vía Outbox.

**(C) Validator**
- **Reglas sintácticas:** `attemptId` UUID; `versionNumber` entero ≥ 1; `observations` array no vacío; cada `observations[i].category` ∈ enum, `strength` ∈ `{STRENGTH, WEAKNESS}`, `explanation`/`suggestion` no vacíos.
- **Reglas semánticas (Handler/Dominio — `FeedbackPolicy`):** jerarquía macro→micro, cobertura de las 10 categorías según corresponda — evaluada por el Aggregate, no por el Validator (el Validator solo valida forma de cada observación individual, nunca la política de conjunto).
- **Validaciones cruzadas:** ninguna adicional.

**(D) Checklist**
✅ Domain Model (`FeedbackPolicy` invocada por `Attempt`, Tell-Don't-Ask) · ✅ Functional Specification (CU-04) · ✅ API Contract (sin endpoint público — exclusión deliberada, coherente) · ✅ Infrastructure Model (`FeedbackGateway`/worker) · ✅ CQRS · ✅ Event-Driven (`FeedbackDelivered`) · ✅ No modifica A-01–A-10.

---

### CMD-05 — SubmitRevision

**(A) Especificación**
- **Nombre:** `SubmitRevisionCommand`.
- **Responsabilidad:** registrar una nueva `Version` tras un ciclo de reescritura.
- **Input DTO:** `interface SubmitRevisionInput { attemptId: string; content: string; }`.
- **Output DTO:** `VersionDTO`.
- **Aggregate involucrado:** `Attempt`.
- **Reglas RN utilizadas:** RN-4 (parcial — el gate mínimo se verifica en CMD-06, no aquí), RN-5.
- **Eventos emitidos:** `RevisionStarted`, `ProductionSubmitted`, `FeedbackRequested`. **(Nota de precisión heredada de la Reconciliación Arquitectónica, hallazgo R-06: los tres se emiten dentro de esta misma invocación, en el momento del envío — no existe, en el Application Model vigente, un disparo separado de `RevisionStarted` en el momento de inicio de la reescritura. Este Handler implementa fielmente esa orquestación ya aprobada, sin introducir un cambio de comportamiento no autorizado por este Sprint.)**
- **Validaciones:** igual que CMD-02 (`content` no vacío, formato).
- **Excepciones:** `ACADEMY_NOT_FOUND_ATTEMPT`, `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND` (no está en `REWRITE`), `ACADEMY_VALIDATION_CONTENT_EMPTY`, `ACADEMY_FORBIDDEN_NOT_OWNER`.
- **Idempotencia:** requiere `Idempotency-Key`; reintento post-éxito falla con `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND`.
- **Autorización:** Estudiante, propietario.

**(B) Command Handler**
- **Nombre:** `SubmitRevisionHandler implements ICommandHandler<SubmitRevisionCommand, VersionDTO>`.
- **Dependencias:** idénticas a `SubmitProductionHandler` (Sección CMD-02).
- **Flujo completo:** 1) `assertAttemptOwnership`. 2) `UnitOfWork.execute(..., studentId)`. 3) `findById` → `ACADEMY_NOT_FOUND_ATTEMPT`. 4) verificar `currentStep === 'REWRITE'` → `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND`. 5) `attempt.submitRevision(content)` — comportamiento Domain: emite `RevisionStarted`, congela nueva `Version`, emite `ProductionSubmitted`/`FeedbackRequested`, vuelve a `RECEIVE_FEEDBACK`. 6) `tx.attemptRepository.save(attempt)`. 7) `tx.outbox.append(...)` × 3 eventos. 8) commit. 9) invocar `FeedbackGatewayPort` (idéntico patrón que CMD-02, paso 10). 10) `AttemptMapper.toVersionDTO(version)` → retorno.
- **Repositorios:** `AttemptRepository`.
- **Unit of Work:** una transacción para el `Attempt`; llamada al Gateway de IA fuera de ella.
- **Publicación de eventos:** `RevisionStarted`, `ProductionSubmitted`, `FeedbackRequested`, los tres vía Outbox en la misma transacción.

**(C) Validator**
- **Reglas sintácticas:** idénticas a `SubmitProductionValidator`.
- **Reglas semánticas (Handler/Dominio):** `currentStep === 'REWRITE'`; `WordCountRange` verificado por el Aggregate.
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model · ✅ Functional Specification (CU-05) · ✅ API Contract (`EP-03`, compartido con CMD-02) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven · ✅ No modifica A-01–A-10.

---

### CMD-06 — AdvanceToReflection

**(A) Especificación**
- **Nombre:** `AdvanceToReflectionCommand`.
- **Responsabilidad:** avanzar del ciclo de reescritura al paso de reflexión, verificando el mínimo exigido.
- **Input DTO:** `interface AdvanceToReflectionInput { attemptId: string; }`.
- **Output DTO:** `AttemptSummaryDTO`.
- **Aggregate involucrado:** `Attempt`.
- **Reglas RN utilizadas:** RN-4, `RevisionPolicy`.
- **Eventos emitidos:** `ReflectionStarted`.
- **Validaciones:** `attemptId` UUID válido.
- **Excepciones:** `ACADEMY_NOT_FOUND_ATTEMPT`, `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND` (no está en `REWRITE`), `ACADEMY_RULE_REVISION_CYCLE_INCOMPLETE`, `ACADEMY_FORBIDDEN_NOT_OWNER`.
- **Idempotencia:** requiere `Idempotency-Key`; reintento sobre un `Attempt` ya en `REFLECT` retorna `200`/mismo resultado sin efecto adicional (semántica ya fijada en `EP-04`).
- **Autorización:** Estudiante, propietario.

**(B) Command Handler**
- **Nombre:** `AdvanceToReflectionHandler implements ICommandHandler<AdvanceToReflectionCommand, AttemptSummaryDTO>`.
- **Dependencias:** `AttemptRepository`, `AttemptMapper`, `UnitOfWork`, `AcademyAuthorizationGuard`.
- **Flujo completo:** 1) `assertAttemptOwnership`. 2) `UnitOfWork.execute(..., studentId)`. 3) `findById` → `ACADEMY_NOT_FOUND_ATTEMPT`. 4) si `currentStep === 'REFLECT'` ya (idempotencia semántica), retornar DTO actual sin re-ejecutar. 5) verificar `currentStep === 'REWRITE'` → `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND`. 6) invocar `attempt.advanceToReflection()` — internamente evalúa `RevisionPolicy` (RN-4) → `ACADEMY_RULE_REVISION_CYCLE_INCOMPLETE` si no se cumple; si se cumple, avanza a `REFLECT`, emite `ReflectionStarted`. 7) `tx.attemptRepository.save(attempt)`. 8) `tx.outbox.append(envelope('ReflectionStarted', ...))`. 9) commit. 10) `AttemptMapper.toSummaryDTO(attempt, { isCurrent: true })` → retorno.
- **Repositorios:** `AttemptRepository`.
- **Unit of Work:** una transacción.
- **Publicación de eventos:** `ReflectionStarted` vía Outbox.

**(C) Validator**
- **Reglas sintácticas:** `attemptId` UUID válido.
- **Reglas semánticas (Handler/Dominio):** `currentStep === 'REWRITE'`; `RevisionPolicy` (mínimo un ciclo).
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model (`RevisionPolicy` invocada por `Attempt`) · ✅ Functional Specification (CU-06, previo) · ✅ API Contract (`EP-04`) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven · ✅ No modifica A-01–A-10.

---

### CMD-07 — CompleteReflection

**(A) Especificación**
- **Nombre:** `CompleteReflectionCommand`.
- **Responsabilidad:** cerrar el `Attempt` (paso `UNLOCK`), disparando eventualmente `COMPLETED` en `AcademyUnit`, `EXTERNAL_ACTIVITY_COMPLETED` condicional y el desbloqueo de la Unidad siguiente. El Command más complejo del módulo — dos Aggregates, dos transacciones.
- **Input DTO:** `interface CompleteReflectionInput { attemptId: string; reflectionAnswers: string[]; }`.
- **Output DTO:** `AcademyUnitDetailDTO` reflejando `state === 'COMPLETED'` (nunca `MASTERED` en esta misma respuesta — ver nota R-05 de la Reconciliación Documental, ya incorporada al API Contract v1.3).
- **Aggregate involucrado:** `Attempt` (transacción 1), `AcademyUnit` propia y, condicionalmente, la Unidad siguiente (transacción 2, en un manejador de evento independiente).
- **Reglas RN utilizadas:** RN-9, RN-10, RN-6, `UnlockPolicy`, `CompletionPolicy`, `EligibleForUnlockSpecification`.
- **Eventos emitidos (en cascada, ver (B)):** `ReflectionCompleted` (transacción 1); `UnitCompleted`, `EXTERNAL_ACTIVITY_COMPLETED` (condicional), `UnitUnlocked` (condicional, sobre la Unidad siguiente) (transacción 2).
- **Validaciones:** `attemptId` UUID válido; `reflectionAnswers` array no vacío.
- **Excepciones:** `ACADEMY_NOT_FOUND_ATTEMPT`, `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND` (no está en `REFLECT`), `ACADEMY_FORBIDDEN_NOT_OWNER`. **`ACADEMY_NOT_FOUND_NEXT_UNIT` nunca se lanza como error** — la ausencia de Unidad siguiente es un caso válido (última Unidad de la progresión), documentado explícitamente en el Application Model v1.4.
- **Idempotencia:** requiere `Idempotency-Key`.
- **Autorización:** Estudiante, propietario del `Attempt`.

**(B) Command Handler**
- **Nombre:** `CompleteReflectionHandler implements ICommandHandler<CompleteReflectionCommand, AcademyUnitDetailDTO>`.
- **Dependencias:** `AttemptRepository`, `AcademyUnitRepository`, `UnitSequenceService` (Domain Service, invocado por Application, no por el Aggregate — Domain Model Sección 11), `AcademyUnitMapper`, `UnitOfWork`, `EventBusPort` (publicación tras confirmación, fuera de este Sprint pero referenciado como dependencia).
- **Flujo completo (orden exacto — reconstruye fielmente el diagrama de secuencia ya congelado en el Application Model v1.4, Sección 15.1):**
  1. `assertAttemptOwnership`.
  2. **Transacción 1** — `UnitOfWork.execute(async (tx) => {...}, studentId)`:
     a. `tx.attemptRepository.findById(attemptId)` → `ACADEMY_NOT_FOUND_ATTEMPT`.
     b. Verificar `currentStep === 'REFLECT'` → `ACADEMY_RULE_INVALID_STEP_FOR_COMMAND`.
     c. `attempt.completeReflection(reflectionAnswers)` → avanza a `UNLOCK`, emite `ReflectionCompleted`.
     d. `tx.attemptRepository.save(attempt)`.
     e. `tx.outbox.append(envelope('ReflectionCompleted', attempt.id, 'Attempt', { unitId }))`.
  3. Commit de la transacción 1. El evento `ReflectionCompleted` queda en Outbox, pendiente de publicación (Infrastructure, fuera de este Sprint).
  4. **Manejador de evento `ReflectionCompleted` → `CompleteUnitOnReflectionCompletedHandler`** (Sección 7.18, ejecutado por el Event Bus tras la confirmación de la transacción 1 — puede ocurrir en el mismo proceso síncronamente para efectos de esta especificación, o de forma asíncrona vía Outbox poller, según decida Infrastructure):
     a. **Transacción 2** — `UnitOfWork.execute(async (tx2) => {...}, undefined)` (contexto de sistema):
        - `tx2.academyUnitRepository.findById(unitId)`.
        - `academyUnit.complete()` → transiciona `REFLECTION → COMPLETED`, emite `UnitCompleted`.
        - `academyUnit.evaluateCompletionPolicy(miPlanTaskLookupPort)` → invoca `CompletionPolicy` (RN-10); si existe tarea de Mi Plan vinculada, emite `EXTERNAL_ACTIVITY_COMPLETED`.
        - `UnitSequenceService.findNextUnit(studentId, textType)` → identifica la Unidad siguiente (si existe).
        - Si existe: `tx2.academyUnitRepository.findById(nextUnitId)`; `nextUnit.evaluateUnlockPolicy()` (invoca `UnlockPolicy`/`EligibleForUnlockSpecification`, RN-6) → si procede, `nextUnit.unlock()`, emite `UnitUnlocked`.
        - `tx2.academyUnitRepository.save(academyUnit)`; si aplica, `tx2.academyUnitRepository.save(nextUnit)`.
        - `tx2.outbox.append(...)` para `UnitCompleted`, `EXTERNAL_ACTIVITY_COMPLETED` (condicional), `UnitUnlocked` (condicional).
     b. Commit de la transacción 2.
  5. `AcademyUnitMapper.toDetailDTO(academyUnit, context)` → retorno **(el retorno de la respuesta HTTP no espera necesariamente a la transacción 2 si Infrastructure decide procesar el evento de forma asíncrona — decisión de Infrastructure, fuera de este Sprint; a nivel de Application, este documento especifica el flujo lógico completo, no su sincronía de ejecución real).**
- **Repositorios utilizados:** `AttemptRepository` (transacción 1), `AcademyUnitRepository` (transacción 2, dos instancias posibles).
- **Unit of Work:** **dos** transacciones separadas, nunca compartidas — cumple estrictamente el patrón de sincronización eventual ya definido.
- **Publicación de eventos:** `ReflectionCompleted` (transacción 1); `UnitCompleted`, `EXTERNAL_ACTIVITY_COMPLETED` (condicional), `UnitUnlocked` (condicional) (transacción 2) — los cuatro vía Outbox.

**(C) Validator**
- **Reglas sintácticas:** `attemptId` UUID válido; `reflectionAnswers` array de strings no vacío.
- **Reglas semánticas (Handler/Dominio):** `currentStep === 'REFLECT'`; `CompletionPolicy`, `UnlockPolicy` evaluadas internamente por `AcademyUnit`, nunca por el Validator ni directamente por el Handler.
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model (`CompletionPolicy`/`UnlockPolicy` invocadas exclusivamente por `AcademyUnit`) · ✅ Functional Specification (CU-06) · ✅ API Contract (`EP-05`) · ✅ Infrastructure Model (patrón Outbox de dos transacciones) · ✅ CQRS · ✅ Event-Driven (cascada de 4 eventos) · ✅ No modifica A-01–A-10 (A-08 aplicado, no reinterpretado).

---

### CMD-08 — EvaluateMastery

**(A) Especificación**
- **Nombre:** `EvaluateMasteryCommand`.
- **Responsabilidad:** evaluar si una `AcademyUnit` ya `COMPLETED` satisface `MasteryPolicy` (RN-8).
- **Input DTO:** `interface EvaluateMasteryInput { unitId: string; }`.
- **Output DTO:** `AcademyUnitDetailDTO`.
- **Aggregate involucrado:** `AcademyUnit`.
- **Reglas RN utilizadas:** RN-8, `MasteryPolicy`, `MasteryEligibleSpecification`, invariante 3.
- **Eventos emitidos:** `UnitMastered` (condicional).
- **Validaciones:** `unitId` UUID válido.
- **Excepciones:** `ACADEMY_NOT_FOUND_UNIT`, `ACADEMY_RULE_MASTERY_NOT_ELIGIBLE` (no es un error expuesto — resultado no-op documentado, ver Handler).
- **Idempotencia:** natural — si ya es `MASTERED`, la operación es no-op (invariante 3); reintentos no tienen efecto adicional.
- **Autorización:** Sistema (`SYSTEM`) — **sin endpoint público** (exclusión deliberada ya documentada en el API Contract). Disparador exacto: **PENDIENTE DE DECISIÓN DE ARQUITECTURA** (heredado, sin resolver en este Sprint — Riesgo 2 del Domain Model).

**(B) Command Handler**
- **Nombre:** `EvaluateMasteryHandler implements ICommandHandler<EvaluateMasteryCommand, AcademyUnitDetailDTO>`.
- **Dependencias:** `AcademyUnitRepository`, `MasteryEvaluationService` (Domain Service), `CompetencyEvidencePort` (puerto de lectura hacia Learning Analytics — fuente exacta PENDIENTE, Riesgo 2 del Domain Model), `AcademyUnitMapper`, `UnitOfWork`.
- **Flujo completo:** 1) `UnitOfWork.execute(..., undefined)` (contexto sistema). 2) `findById(unitId)` → `ACADEMY_NOT_FOUND_UNIT`. 3) si `unit.state === 'MASTERED'`, retornar DTO actual sin más acción (no-op, invariante 3). 4) verificar `unit.state === 'COMPLETED'` — si no, no-op (no tiene sentido evaluar). 5) `CompetencyEvidencePort.getEvidence(unit.studentId, unit.textType)` → evidencia externa. 6) `MasteryEvaluationService.evaluate(unit, evidence)` → invoca `MasteryPolicy`/`MasteryEligibleSpecification` (RN-8). 7) si se satisface: `unit.markAsMastered()` → emite `UnitMastered`; `tx.academyUnitRepository.save(unit)`; `tx.outbox.append(...)`. 8) si no se satisface: no-op, sin escritura. 9) commit. 10) `AcademyUnitMapper.toDetailDTO(unit, context)` → retorno.
- **Repositorios:** `AcademyUnitRepository`.
- **Unit of Work:** una transacción (`AcademyUnit` es un único Aggregate — operación de punta a punta, sin sincronización eventual).
- **Publicación de eventos:** `UnitMastered`, condicional.

**(C) Validator**
- **Reglas sintácticas:** `unitId` UUID válido.
- **Reglas semánticas (Handler/Dominio):** `state ∈ {COMPLETED, MASTERED}` para que la evaluación tenga sentido; `MasteryPolicy` evaluada por `MasteryEvaluationService`, nunca por el Validator.
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model (`MasteryEvaluationService` invocado por `AcademyUnit`, resultado aplicado por ella misma) · ✅ Functional Specification (A-07, "Dominar") · ✅ API Contract (exclusión deliberada, coherente) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven (`UnitMastered`) · ✅ No modifica A-01–A-10.

---

### CMD-09 — RepeatUnit

**(A) Especificación**
- **Nombre:** `RepeatUnitCommand`.
- **Responsabilidad:** iniciar un nuevo `Attempt` sobre una `AcademyUnit` ya `COMPLETED`/`MASTERED`, sin alterar su `UnitState` (H-03).
- **Input DTO:** `interface RepeatUnitInput { unitId: string; studentId: string; }`.
- **Output DTO:** `AttemptSummaryDTO`.
- **Aggregate involucrado:** `AcademyUnit` (lectura + emisión de `UnitRepeated`), `Attempt` (creación).
- **Reglas RN utilizadas:** RN-11, RN-12, `RepetitionPolicy`, `RepeatableSpecification`.
- **Eventos emitidos:** `UnitRepeated`.
- **Validaciones:** `unitId`/`studentId` UUID válidos.
- **Excepciones:** `ACADEMY_NOT_FOUND_UNIT`, `ACADEMY_RULE_UNIT_NOT_REPEATABLE`, `ACADEMY_FORBIDDEN_NOT_OWNER`.
- **Idempotencia:** requiere `Idempotency-Key`.
- **Autorización:** Estudiante (propietario) o Profesor (como reinicio supervisado — ver CMD-10, que reutiliza este mismo comportamiento internamente para `FORCE_RESTART`).

**(B) Command Handler**
- **Nombre:** `RepeatUnitHandler implements ICommandHandler<RepeatUnitCommand, AttemptSummaryDTO>`.
- **Dependencias:** `AcademyUnitRepository`, `AttemptRepository`, `AttemptMapper`, `UnitOfWork`, `AcademyAuthorizationGuard`.
- **Flujo completo:** 1) `assertOwnership` (o autorización de Profesor si invocado desde CMD-10). 2) `UnitOfWork.execute(..., studentId)` — **operación de un único Aggregate lógico** (`AcademyUnit` + creación de `Attempt`, sin cruce de límite en el sentido de sincronización eventual, dado que `AcademyUnit` no cambia de estado — H-03). 3) `findById(unitId)` → `ACADEMY_NOT_FOUND_UNIT`. 4) verificar `RepeatableSpecification.isSatisfiedBy(unit)` (`state ∈ {COMPLETED, MASTERED}`) → `ACADEMY_RULE_UNIT_NOT_REPEATABLE`. 5) `unit.repeat()` → invoca `RepetitionPolicy`, emite `UnitRepeated` (`UnitState` **sin cambio**, confirmado H-03). 6) `AttemptFactory.create(unit, studentId)` → nuevo `Attempt` en `CONTEXTUALIZE`. 7) `tx.academyUnitRepository.save(unit)`, `tx.attemptRepository.save(newAttempt)`. 8) `tx.outbox.append(envelope('UnitRepeated', ...))`. 9) commit. 10) `AttemptMapper.toSummaryDTO(newAttempt, { isCurrent: true })` → retorno.
- **Repositorios:** `AcademyUnitRepository`, `AttemptRepository`.
- **Unit of Work:** **una única transacción** — CMD-09 es, junto con CMD-10, la excepción de punta a punta sin sincronización eventual (Application Model v1.4, Sección 7).
- **Publicación de eventos:** `UnitRepeated` vía Outbox.

**(C) Validator**
- **Reglas sintácticas:** `unitId`/`studentId` UUID válidos.
- **Reglas semánticas (Handler/Dominio):** `RepeatableSpecification`/`RepetitionPolicy`.
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model (H-03 respetado: `UnitState` sin transición) · ✅ Functional Specification (CU-07, A-09) · ✅ API Contract (`EP-06`) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven (`UnitRepeated`) · ✅ No modifica A-01–A-10.

---

### CMD-10 — ApplyTeacherOverride

**(A) Especificación**
- **Nombre:** `ApplyTeacherOverrideCommand`.
- **Responsabilidad:** forzar `LOCKED` o reiniciar una `AcademyUnit`, como excepción manual del Profesor (A-10).
- **Input DTO:**
  ```typescript
  interface ApplyTeacherOverrideInput {
    unitId: string;
    action: 'FORCE_LOCK' | 'FORCE_RESTART';
    reason: string;
    teacherId: string;
  }
  ```
- **Output DTO:** `TeacherOverrideDTO`.
- **Aggregate involucrado:** `AcademyUnit` (entidad interna `TeacherOverride`); si `action === 'FORCE_RESTART'`, invoca internamente el mismo comportamiento de `RepeatUnit` (CMD-09) sobre el mismo Aggregate ya cargado.
- **Reglas RN utilizadas:** RN-13, `TeacherOverridePolicy`, invariante 10.
- **Eventos emitidos:** `TeacherOverrideApplied`.
- **Validaciones:** `action` ∈ enum; `reason` no vacío (`ACADEMY_VALIDATION_EMPTY_OVERRIDE_REASON`).
- **Excepciones:** `ACADEMY_NOT_FOUND_UNIT`, `ACADEMY_RULE_OVERRIDE_NOT_VALID_FOR_STATE`, `ACADEMY_FORBIDDEN_NO_TEACHER_RELATIONSHIP`, `ACADEMY_VALIDATION_INVALID_OVERRIDE_ACTION`, `ACADEMY_VALIDATION_EMPTY_OVERRIDE_REASON`.
- **Idempotencia:** requiere `Idempotency-Key`; **no se trata como naturalmente idempotente** (cada invocación es un evento de auditoría distinto con su propia identidad, ya señalado en el Application Model v1.4) — la deduplicación depende exclusivamente de la clave de idempotencia de transporte, no de una regla de negocio.
- **Autorización:** Profesor, con relación docente-estudiante verificada (mecanismo exacto: `TeacherStudentRelationshipPort`, **PENDIENTE DE DECISIÓN DE ARQUITECTURA**, PND-04, delegado a Organización Académica — este Handler invoca el puerto, no resuelve el mecanismo).

**(B) Command Handler**
- **Nombre:** `ApplyTeacherOverrideHandler implements ICommandHandler<ApplyTeacherOverrideCommand, TeacherOverrideDTO>`.
- **Dependencias:** `AcademyUnitRepository`, `TeacherStudentRelationshipPort`, `TeacherOverrideMapper`, `UnitOfWork`, `AttemptFactory` (reutilizado internamente para `FORCE_RESTART`).
- **Flujo completo:** 1) `TeacherStudentRelationshipPort.assertRelationship(teacherId, unit.studentId)` → `ACADEMY_FORBIDDEN_NO_TEACHER_RELATIONSHIP` si falla (requiere una lectura previa del `unit.studentId`, ver paso 3). 2) `UnitOfWork.execute(..., undefined)` (`withServiceContext`). 3) `findById(unitId)` → `ACADEMY_NOT_FOUND_UNIT`. 4) `unit.applyTeacherOverride(action, teacherId, reason)` — internamente evalúa `TeacherOverridePolicy` (RN-13) → `ACADEMY_RULE_OVERRIDE_NOT_VALID_FOR_STATE` si no procede; si procede: registra `TeacherOverride` (entidad interna); aplica el efecto (`FORCE_LOCK` → `LOCKED`; `FORCE_RESTART` → mismo comportamiento que `unit.repeat()` de CMD-09 más desbloqueo forzado); **el `Attempt` activo, si existe, no se toca** (invariante 10 — queda huérfano); emite `TeacherOverrideApplied`. 5) `tx.academyUnitRepository.save(unit)`. 6) `tx.outbox.append(envelope('TeacherOverrideApplied', ...))`. 7) commit. 8) `TeacherOverrideMapper.toDTO(override)` → retorno.
- **Repositorios:** `AcademyUnitRepository`.
- **Unit of Work:** una única transacción — segunda excepción de punta a punta (junto con CMD-09).
- **Publicación de eventos:** `TeacherOverrideApplied` vía Outbox.

**(C) Validator**
- **Reglas sintácticas:** `unitId`/`teacherId` UUID válidos; `action` ∈ `{FORCE_LOCK, FORCE_RESTART}`; `reason` string no vacío.
- **Reglas semánticas (Handler/Dominio):** `TeacherOverridePolicy` (estado elegible según la acción); relación docente-estudiante (delegada a un puerto externo, no evaluada por el Validator).
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model (invariante 10: `Attempt` activo nunca modificado directamente) · ✅ Functional Specification (CU-10, Regla funcional 8/13) · ✅ API Contract (`EP-07`) · ✅ Infrastructure Model (`AcademyAuthorizationGuard`) · ✅ CQRS · ✅ Event-Driven (`TeacherOverrideApplied`) · ✅ No modifica A-01–A-10.

---

### CMD-11 — AssignUnitToStudent (recomendar)

**(A) Especificación**
- **Nombre:** `AssignUnitToStudentCommand`.
- **Responsabilidad:** registrar una recomendación pedagógica informativa, sin efecto de estado (resolución ARB, ACP-002-A).
- **Input DTO:** `interface AssignUnitToStudentInput { unitId: string; studentId: string; teacherId: string; }`.
- **Output DTO:** `TeacherRecommendationDTO`.
- **Aggregate involucrado:** **ninguno** — no carga ni invoca comportamiento de `AcademyUnit` (decisión ya vinculante, ver Application Model v1.4, Sección 3).
- **Reglas RN utilizadas:** ninguna (Regla funcional 12 de la Functional Specification: exclusivamente informativa).
- **Eventos emitidos:** ninguno.
- **Validaciones:** `unitId`/`studentId`/`teacherId` UUID válidos.
- **Excepciones:** `ACADEMY_NOT_FOUND_UNIT`, `ACADEMY_NOT_FOUND_STUDENT`, `ACADEMY_FORBIDDEN_NO_TEACHER_RELATIONSHIP`.
- **Idempotencia:** requiere `Idempotency-Key`.
- **Autorización:** Profesor, con relación docente-estudiante verificada.

**(B) Command Handler**
- **Nombre:** `AssignUnitToStudentHandler implements ICommandHandler<AssignUnitToStudentCommand, TeacherRecommendationDTO>`.
- **Dependencias:** `TeacherRecommendationRepository`, `AcademyUnitRepository` (solo para `ACADEMY_NOT_FOUND_UNIT`, lectura de existencia — nunca invoca comportamiento), `TeacherStudentRelationshipPort`.
- **Flujo completo:** 1) `TeacherStudentRelationshipPort.assertRelationship(teacherId, studentId)` → `ACADEMY_FORBIDDEN_NO_TEACHER_RELATIONSHIP`. 2) `academyUnitRepository.findById(unitId)` → `ACADEMY_NOT_FOUND_UNIT` (verificación de existencia, sin `UnitOfWork` transaccional dado que no hay escritura sobre ningún Aggregate). 3) `teacherRecommendationRepository.create({ unitId, studentId, teacherId, recommendedAt: now() })`. 4) construir `TeacherRecommendationDTO` directamente desde el resultado del paso 3 (sin Mapper de Aggregate, dado que no hay Aggregate involucrado) → retorno.
- **Repositorios:** `TeacherRecommendationRepository` (escritura), `AcademyUnitRepository` (lectura de existencia únicamente).
- **Unit of Work:** **no aplica** — sin Aggregate de dominio que proteger transaccionalmente; la escritura de infraestructura pura (`create`) es responsabilidad de `TeacherRecommendationRepository` directamente.
- **Publicación de eventos:** ninguna.

**(C) Validator**
- **Reglas sintácticas:** `unitId`/`studentId`/`teacherId` UUID válidos.
- **Reglas semánticas:** ninguna regla de negocio de dominio (no hay Aggregate); la única verificación es de autorización (relación docente-estudiante), no de Business Rule.
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model (correctamente sin tocar ningún Aggregate, consistente con la resolución ARB) · ✅ Functional Specification (CU-11) · ✅ API Contract (`EP-08`) · ✅ Infrastructure Model (`TeacherRecommendationRepository`, ya definido) · ✅ CQRS · ✅ Event-Driven (sin evento, por diseño) · ✅ No modifica A-01–A-10.

---

### CMD-12 — CreateModelExample

**(A) Especificación**
- **Nombre:** `CreateModelExampleCommand`.
- **Responsabilidad:** crear un nuevo `ModelExample` en la Biblioteca de Modelos.
- **Input DTO:**
  ```typescript
  interface CreateModelExampleInput {
    textType: TextType;
    content: string;
    rating: 'EXCELLENT' | 'HAS_ERRORS';
    curatorialComment: string;
  }
  ```
- **Output DTO:** `ModelExampleDTO`.
- **Aggregate involucrado:** `ModelExample`.
- **Reglas RN utilizadas:** RN-16.
- **Eventos emitidos:** ninguno (sin eventos de dominio para el ciclo editorial).
- **Validaciones:** `textType` ∈ enum (`ACADEMY_VALIDATION_INVALID_TEXT_TYPE`); `content`/`curatorialComment` no vacíos.
- **Excepciones:** `ACADEMY_VALIDATION_INVALID_TEXT_TYPE`, `ACADEMY_FORBIDDEN_ROLE_NOT_ALLOWED` (actor ≠ Administrador).
- **Idempotencia:** requiere `Idempotency-Key`.
- **Autorización:** exclusivamente Administrador.

**(B) Command Handler**
- **Nombre:** `CreateModelExampleHandler implements ICommandHandler<CreateModelExampleCommand, ModelExampleDTO>`.
- **Dependencias:** `ModelExampleRepository`, `ModelExampleMapper`, `UnitOfWork`.
- **Flujo completo:** 1) verificar `actor.role === 'ADMIN'` → `ACADEMY_FORBIDDEN_ROLE_NOT_ALLOWED`. 2) `UnitOfWork.execute(..., undefined)`. 3) construir `ModelExample` (constructor simple — sin Factory dedicada, Domain Model Sección 12) con `textType`, `content`, `rating`, `curatorialComment`. 4) `tx.modelExampleRepository.save(example)`. 5) commit (sin Outbox). 6) `ModelExampleMapper.toDTO(example)` → retorno con `status: 'ACTIVE'`.
- **Repositorios:** `ModelExampleRepository`.
- **Unit of Work:** una transacción, sin Outbox.
- **Publicación de eventos:** ninguna.

**(C) Validator**
- **Reglas sintácticas:** `textType` ∈ enum; `content`/`curatorialComment` no vacíos; `rating` ∈ `{EXCELLENT, HAS_ERRORS}`.
- **Reglas semánticas:** ninguna adicional (RN-16 se satisface por construcción, no requiere verificación de estado previo).
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model (H-04: Administrador autorizado dentro del mismo Bounded Context) · ✅ Functional Specification (§6.15) · ✅ API Contract (`EP-09`, incluye `rating` desde R-02) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven (sin evento, por diseño) · ✅ No modifica A-01–A-10.

---

### CMD-13 — UpdateModelExample

**(A) Especificación**
- **Nombre:** `UpdateModelExampleCommand`.
- **Responsabilidad:** editar contenido/comentario curatorial de un `ModelExample` existente.
- **Input DTO:** `interface UpdateModelExampleInput { modelExampleId: string; content?: string; curatorialComment?: string; }`.
- **Output DTO:** `ModelExampleDTO`.
- **Aggregate involucrado:** `ModelExample`.
- **Reglas RN utilizadas:** RN-14 (el Profesor no puede ejecutar este Command).
- **Eventos emitidos:** ninguno.
- **Validaciones:** al menos uno de `content`/`curatorialComment` presente; si presente, no vacío.
- **Excepciones:** `ACADEMY_NOT_FOUND_MODEL_EXAMPLE`, `ACADEMY_FORBIDDEN_ROLE_NOT_ALLOWED`.
- **Idempotencia:** natural por semántica de actualización parcial (`PATCH`).
- **Autorización:** exclusivamente Administrador.

**(B) Command Handler**
- **Nombre:** `UpdateModelExampleHandler implements ICommandHandler<UpdateModelExampleCommand, ModelExampleDTO>`.
- **Dependencias:** `ModelExampleRepository`, `ModelExampleMapper`, `UnitOfWork`.
- **Flujo completo:** 1) verificar rol `ADMIN` → `ACADEMY_FORBIDDEN_ROLE_NOT_ALLOWED`. 2) `UnitOfWork.execute(...)`. 3) `findById(modelExampleId)` → `ACADEMY_NOT_FOUND_MODEL_EXAMPLE`. 4) `example.update({ content, curatorialComment })` (aplica solo los campos presentes). 5) `tx.modelExampleRepository.save(example)`. 6) commit. 7) `ModelExampleMapper.toDTO(example)` → retorno.
- **Repositorios:** `ModelExampleRepository`.
- **Unit of Work:** una transacción, sin Outbox.
- **Publicación de eventos:** ninguna.

**(C) Validator**
- **Reglas sintácticas:** `modelExampleId` UUID válido; al menos un campo de actualización presente y no vacío si se envía.
- **Reglas semánticas:** RN-14 verificada por autorización (Handler), no por el Validator.
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model · ✅ Functional Specification (RN-14) · ✅ API Contract (`EP-10`) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven (sin evento) · ✅ No modifica A-01–A-10.

---

### CMD-14 — RetireModelExample

**(A) Especificación**
- **Nombre:** `RetireModelExampleCommand`.
- **Responsabilidad:** retirar (baja lógica) un `ModelExample` de la Biblioteca.
- **Input DTO:** `interface RetireModelExampleInput { modelExampleId: string; }`.
- **Output DTO:** `ModelExampleDTO` con `status: 'RETIRED'`.
- **Aggregate involucrado:** `ModelExample`.
- **Reglas RN utilizadas:** ninguna RN específica adicional (CU-08, excepción de retiro).
- **Eventos emitidos:** ninguno.
- **Validaciones:** `modelExampleId` UUID válido.
- **Excepciones:** `ACADEMY_NOT_FOUND_MODEL_EXAMPLE`, `ACADEMY_CONFLICT_MODEL_EXAMPLE_ALREADY_RETIRED` (no bloqueante — ver Handler, idempotente), `ACADEMY_FORBIDDEN_ROLE_NOT_ALLOWED`.
- **Idempotencia:** natural — retirar dos veces produce el mismo estado final (`status: 'RETIRED'`), sin excepción en el segundo intento.
- **Autorización:** exclusivamente Administrador.

**(B) Command Handler**
- **Nombre:** `RetireModelExampleHandler implements ICommandHandler<RetireModelExampleCommand, ModelExampleDTO>`.
- **Dependencias:** `ModelExampleRepository`, `ModelExampleMapper`, `UnitOfWork`.
- **Flujo completo:** 1) verificar rol `ADMIN`. 2) `UnitOfWork.execute(...)`. 3) `findById` → `ACADEMY_NOT_FOUND_MODEL_EXAMPLE`. 4) si ya `status === 'RETIRED'`, continuar sin error (idempotente). 5) `tx.modelExampleRepository.retire(modelExampleId)`. 6) commit. 7) `ModelExampleMapper.toDTO(example)` con `status: 'RETIRED'` → retorno. **Nota:** el tratamiento de un `ModelExample` referenciado por un `Attempt` activo en el momento del retiro permanece **PENDIENTE DE DECISIÓN DE ARQUITECTURA** (heredado, sin resolver en este Sprint — el `Attempt` simplemente dejará de poder resolver esa referencia en lecturas futuras, sin que esto viole ninguna invariante, dado que `Attempt` referencia `ModelExample` solo por identidad y en modo lectura).
- **Repositorios:** `ModelExampleRepository`.
- **Unit of Work:** una transacción, sin Outbox.
- **Publicación de eventos:** ninguna.

**(C) Validator**
- **Reglas sintácticas:** `modelExampleId` UUID válido.
- **Reglas semánticas:** ninguna (operación siempre válida sobre un recurso existente, idempotente).
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model · ✅ Functional Specification (CU-08, excepción) · ✅ API Contract (`EP-11`) · ✅ Infrastructure Model (`retire`, soft-delete) · ✅ CQRS · ✅ Event-Driven (sin evento) · ✅ No modifica A-01–A-10.

---

### CMD-15 — ProvisionAcademyUnitsForStudent

**(A) Especificación**
- **Nombre:** `ProvisionAcademyUnitsForStudentCommand`.
- **Responsabilidad:** crear el catálogo inicial de `AcademyUnit` para un Estudiante nuevo.
- **Input DTO:** `interface ProvisionAcademyUnitsForStudentInput { studentId: string; }`.
- **Output DTO:** `AcademyUnitSummaryDTO[]` (catálogo completo provisionado).
- **Aggregate involucrado:** `AcademyUnit` (creación en lote).
- **Reglas RN utilizadas:** ninguna RN específica — comportamiento de `AcademyUnitFactory`/`UnitSequenceService`.
- **Eventos emitidos:** ninguno definido en el Domain Model para este momento (confirmado, sin invención).
- **Validaciones:** `studentId` UUID válido.
- **Excepciones:** `ACADEMY_NOT_FOUND_STUDENT`, `ACADEMY_FORBIDDEN_SYSTEM_ONLY_OPERATION` (actor ≠ Sistema).
- **Idempotencia:** **requerida pero no naturalmente garantizada por el Domain Model** — el Handler debe verificar si el estudiante ya tiene catálogo provisionado antes de crear duplicados (ver paso 3 del Handler); mecanismo exacto de verificación: consulta directa al `AcademyUnitRepository`, no requiere un mecanismo de idempotencia de transporte adicional dado que no es un endpoint público.
- **Autorización:** exclusivamente Sistema — **sin endpoint público** (exclusión deliberada). Disparador exacto: **PENDIENTE DE DECISIÓN DE ARQUITECTURA** (heredado, sin resolver en este Sprint).

**(B) Command Handler**
- **Nombre:** `ProvisionAcademyUnitsForStudentHandler implements ICommandHandler<ProvisionAcademyUnitsForStudentCommand, AcademyUnitSummaryDTO[]>`.
- **Dependencias:** `AcademyUnitRepository`, `UnitSequenceService`, `AcademyUnitFactory`, `AcademyUnitMapper`, `UnitOfWork`, `AcademyUnitCatalogPort` (fuente del catálogo de Unidades disponibles — puerto de lectura, mecanismo exacto fuera de alcance de este Sprint).
- **Flujo completo:** 1) verificar `actor.role === 'SYSTEM'`. 2) `UnitOfWork.execute(..., studentId)`. 3) `tx.academyUnitRepository.findAllByStudent(studentId)` — si ya existe catálogo (longitud > 0), retornar el catálogo existente sin recrear (idempotencia). 4) `AcademyUnitCatalogPort.getCatalog()` → lista de `(textType, position)` disponibles. 5) para cada entrada: `UnitSequenceService.determinePosition(studentId, textType, position)`; `AcademyUnitFactory.create(studentId, textType, position)` → `UNLOCKED` si es la primera Unidad de su `TextType`, `LOCKED` en cualquier otro caso. 6) `tx.academyUnitRepository.save(unit)` por cada una. 7) commit (sin Outbox — sin evento definido). 8) `AcademyUnitMapper.toSummaryDTO(unit, context)` por cada Unidad → retorno del arreglo completo.
- **Repositorios:** `AcademyUnitRepository`.
- **Unit of Work:** una transacción (creación en lote de múltiples instancias del mismo tipo de Aggregate — consistente con "un `AcademyUnit` por operación de escritura" del Infrastructure Model interpretado aquí como una transacción por operación de Command, no por instancia individual, dado que se trata de una única operación lógica de provisión).
- **Publicación de eventos:** ninguna.

**(C) Validator**
- **Reglas sintácticas:** `studentId` UUID válido.
- **Reglas semánticas:** ninguna regla RN específica — la determinación de estado inicial (`UNLOCKED`/`LOCKED`) es responsabilidad de `AcademyUnitFactory`, no del Validator ni directamente del Handler.
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model (`AcademyUnitFactory`/`UnitSequenceService` invocados sin redefinir su comportamiento) · ✅ Functional Specification (origen documentado como pendiente de aclaración — F-04, aún abierto, no bloqueante) · ✅ API Contract (exclusión deliberada) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven (sin evento, por diseño) · ✅ No modifica A-01–A-10.

---

### CMD-16 — AdvanceStep

**(A) Especificación**
- **Nombre:** `AdvanceStepCommand`.
- **Responsabilidad:** avanzar un `Attempt` un paso dentro de los pasos de contenido sin puerta de validación propia, previos a la producción (CU-02).
- **Input DTO:** `interface AdvanceStepInput { attemptId: string; }` (sin cuerpo adicional — avanza siempre al siguiente paso elegible).
- **Output DTO:** `AttemptSummaryDTO` (con `currentStep` actualizado).
- **Aggregate involucrado:** `Attempt`.
- **Reglas RN utilizadas:** ninguna RN numerada específica — el orden de los 11 pasos está protegido como invariante del propio Aggregate (enum `UnitStep`, ya Frozen).
- **Eventos emitidos:** ninguno (mismo criterio de granularidad que `CMD-03 AutosaveDraft`).
- **Validaciones:** `attemptId` UUID válido.
- **Excepciones:** `ACADEMY_NOT_FOUND_ATTEMPT`, `ACADEMY_CONFLICT_STEP_NOT_ELIGIBLE` (`currentStep` ∈ `{COMPREHEND, PRODUCE, ...}` o cualquier paso posterior a `PRACTICE` — este Command no aplica ahí).
- **Idempotencia:** requiere `Idempotency-Key` — un reintento sin protección duplicaría el avance de paso.
- **Autorización:** Estudiante, propietario del `Attempt` (RLS).

**(B) Command Handler**
- **Nombre:** `AdvanceStepHandler implements ICommandHandler<AdvanceStepCommand, AttemptSummaryDTO>`.
- **Dependencias:** `AttemptRepository`, `AttemptMapper`, `UnitOfWork`.
- **Flujo completo:** 1) `UnitOfWork.execute(..., studentId)`. 2) `tx.attemptRepository.findById(attemptId)` → `ACADEMY_NOT_FOUND_ATTEMPT`. 3) verificar `attempt.currentStep ∈ {CONTEXTUALIZE, DEFINE_OBJECTIVES, OBSERVE, ANALYZE, PRACTICE}` → `ACADEMY_CONFLICT_STEP_NOT_ELIGIBLE` si no. 4) `attempt.advanceStep()` (comportamiento del Aggregate, respeta la secuencia oficial de 11 pasos, A-02). 5) `tx.attemptRepository.save(attempt)`. 6) commit (sin Outbox — sin evento). 7) `AttemptMapper.toSummaryDTO(attempt)` → retorno.
- **Repositorios:** `AttemptRepository`.
- **Unit of Work:** una transacción sobre `Attempt`, sin Outbox.
- **Publicación de eventos:** ninguna.

**(C) Validator**
- **Reglas sintácticas:** `attemptId` UUID válido.
- **Reglas semánticas:** ninguna adicional — la elegibilidad del paso (Business Rule, no Validation) se verifica en el Handler contra el estado cargado del Aggregate, no en el Validator (que no tiene acceso al estado del `Attempt`).
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model (invariante de secuencia de `UnitStep`, ya Frozen) · ✅ Functional Specification (CU-02, Regla funcional 1) · ✅ API Contract (`EP-21`) · ✅ Infrastructure Model (`AttemptRepository`) · ✅ CQRS · ✅ Event-Driven (sin evento, por diseño — mismo criterio que `CMD-03`) · ✅ No modifica A-01–A-10.

---

### CMD-17 — VerifyComprehension

**(A) Especificación**
- **Nombre:** `VerifyComprehensionCommand`.
- **Responsabilidad:** registrar la verificación de comprensión de la consigna exigida por RN-2/CU-02, puerta previa obligatoria a la producción.
- **Input DTO:** `interface VerifyComprehensionInput { attemptId: string; comprehensionResponse: unknown; }` (forma exacta de `comprehensionResponse`: **PENDIENTE DE DECISIÓN DE ARQUITECTURA**, heredada sin resolver de la Functional Specification/Application Model — no introducida por este Sprint).
- **Output DTO:** `AttemptSummaryDTO` (con `currentStep` actualizado a `OBSERVE` si la verificación fue satisfactoria; sin cambio si no lo fue).
- **Aggregate involucrado:** `Attempt`.
- **Reglas RN utilizadas:** RN-2.
- **Eventos emitidos:** ninguno (mismo criterio que `CMD-16`).
- **Validaciones:** `attemptId` UUID válido; `comprehensionResponse` presente.
- **Excepciones:** `ACADEMY_NOT_FOUND_ATTEMPT`, `ACADEMY_CONFLICT_NOT_IN_COMPREHEND_STEP` (`currentStep != COMPREHEND`).
- **Idempotencia:** requiere `Idempotency-Key`.
- **Autorización:** Estudiante, propietario del `Attempt` (RLS).

**(B) Command Handler**
- **Nombre:** `VerifyComprehensionHandler implements ICommandHandler<VerifyComprehensionCommand, AttemptSummaryDTO>`.
- **Dependencias:** `AttemptRepository`, `AttemptMapper`, `UnitOfWork`.
- **Flujo completo:** 1) `UnitOfWork.execute(..., studentId)`. 2) `tx.attemptRepository.findById(attemptId)` → `ACADEMY_NOT_FOUND_ATTEMPT`. 3) verificar `attempt.currentStep === 'COMPREHEND'` → `ACADEMY_CONFLICT_NOT_IN_COMPREHEND_STEP` si no. 4) evaluar `comprehensionResponse` (mecanismo exacto de evaluación: **PENDIENTE DE DECISIÓN DE ARQUITECTURA**, no resuelto por este Sprint — el Handler delega en el comportamiento del Aggregate, que encapsula el criterio RN-2). 5) `attempt.verifyComprehension(comprehensionResponse)` → si satisfactoria: marca la puerta RN-2 como cumplida y avanza `currentStep` a `OBSERVE`; si no: `Attempt` permanece en `COMPREHEND` sin lanzar excepción (caso `422` documentado en `EP-22`, no un error de aplicación). 6) `tx.attemptRepository.save(attempt)`. 7) commit (sin Outbox — sin evento). 8) `AttemptMapper.toSummaryDTO(attempt)` → retorno.
- **Repositorios:** `AttemptRepository`.
- **Unit of Work:** una transacción sobre `Attempt`, sin Outbox.
- **Publicación de eventos:** ninguna — la puerta RN-2 queda reflejada en el estado persistido de `Attempt`, consumida internamente por la precondición ya existente de `CMD-02` desde v1.0.

**(C) Validator**
- **Reglas sintácticas:** `attemptId` UUID válido; `comprehensionResponse` presente y no vacío.
- **Reglas semánticas:** RN-2 (verificación de comprensión) se evalúa en el Handler/Aggregate, no en el Validator — el Validator solo confirma la presencia sintáctica de la respuesta, nunca su suficiencia (Validation vs. Business Rule).
- **Validaciones cruzadas:** ninguna.

**(D) Checklist**
✅ Domain Model (RN-2, protegida directamente por el Aggregate `Attempt`) · ✅ Functional Specification (CU-02, excepción de reintento) · ✅ API Contract (`EP-22`) · ✅ Infrastructure Model (`AttemptRepository`) · ✅ CQRS · ✅ Event-Driven (sin evento, por diseño) · ✅ No modifica A-01–A-10.

---

## 8. Queries y Query Handlers

**Regla transversal (Sección 0/4):** todo Query Handler de esta sección utiliza **exclusivamente** `AcademyReadModelPort` — ninguno carga Aggregates ni invoca Repositories de escritura. `QRY-08` está formalmente retirada (ACP-002-B) y excluida de esta sección.

---

### QRY-01 — ListAcademyUnitsForStudent

**(A) Especificación**
- **Propósito:** obtener el mapa completo de `AcademyUnit` de un Estudiante, con su estado.
- **Filtros:** `studentId` (obligatorio); `textType` (opcional).
- **DTO de salida:** `AcademyUnitSummaryDTO[]`, anotado opcionalmente con el resultado de `EligibleForUnlockSpecification`/`RepeatableSpecification` por Unidad (proyección de solo lectura, no invocación de la Specification sobre el Aggregate).
- **Paginación:** no aplica — conjunto acotado por diseño (máximo de Unidades por `TextType`, catálogo fijo).
- **Ordenamiento:** por `textType`, luego por `position` ascendente.
- **Autorización:** Estudiante, sobre sus propias Unidades (RLS).

**(B) Query Handler**
- **Nombre:** `ListAcademyUnitsForStudentHandler implements IQueryHandler<ListAcademyUnitsForStudentQuery, AcademyUnitSummaryDTO[]>`.
- **Repositorios utilizados:** exclusivamente `AcademyReadModelPort.listUnitsForStudent(studentId, textType?)`.
- **Joins necesarios:** `AcademyUnit` + proyección de elegibilidad (`isEligibleForUnlock`, `isRepeatable`) resuelta en la propia proyección de lectura, no mediante invocación de la Specification sobre el Aggregate en tiempo de consulta.
- **Proyecciones:** una fila por `AcademyUnit` del estudiante.
- **Consultas optimizadas:** un único acceso al Read Model, sin N+1 (la elegibilidad se computa en la proyección, no por Unidad individual).

**(D) Checklist**
✅ Domain Model (no se invoca ningún Aggregate) · ✅ Functional Specification (CU-01, pantalla de mapa de unidades) · ✅ API Contract (`EP-12`) · ✅ Infrastructure Model (`read-models/academy-query.service.ts`) · ✅ CQRS (lectura pura vía `AcademyReadModelPort`) · ✅ Event-Driven (N/A) · ✅ No modifica A-01–A-10.

---

### QRY-02 — GetAcademyUnitDetail

**(A) Especificación**
- **Propósito:** obtener el detalle de una `AcademyUnit` específica.
- **Filtros:** `unitId` (obligatorio).
- **DTO de salida:** `AcademyUnitDetailDTO`.
- **Paginación:** no aplica (recurso único).
- **Ordenamiento:** no aplica.
- **Autorización:** Estudiante, propietario de la Unidad (RLS).

**(B) Query Handler**
- **Nombre:** `GetAcademyUnitDetailHandler implements IQueryHandler<GetAcademyUnitDetailQuery, AcademyUnitDetailDTO>`.
- **Repositorios utilizados:** exclusivamente `AcademyReadModelPort.getUnitDetail(unitId)`.
- **Joins necesarios:** `AcademyUnit` + `activeAttemptId` (si existe) + `attemptsCount` + `teacherOverrideCount`, resueltos en la proyección.
- **Proyecciones:** una fila.
- **Consultas optimizadas:** un único acceso al Read Model.
- **Excepciones:** `ACADEMY_NOT_FOUND_UNIT`.

**(D) Checklist**
✅ Domain Model · ✅ Functional Specification (CU-01) · ✅ API Contract (`EP-13`) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven (N/A) · ✅ No modifica A-01–A-10.

---

### QRY-03 — GetContinuationState

**(A) Especificación**
- **Propósito:** soportar "Continúa donde te quedaste" (A-06) — recuperar la Unidad activa, el paso actual y el contenido del `Draft`.
- **Filtros:** `studentId` (obligatorio).
- **DTO de salida:** `ContinuationStateDTO` (o vacío si no hay ningún `Attempt` activo).
- **Paginación:** no aplica.
- **Ordenamiento:** no aplica.
- **Autorización:** Estudiante, sobre sí mismo (RLS).

**(B) Query Handler**
- **Nombre:** `GetContinuationStateHandler implements IQueryHandler<GetContinuationStateQuery, ContinuationStateDTO | null>`.
- **Repositorios utilizados:** exclusivamente `AcademyReadModelPort.getContinuationState(studentId)`.
- **Joins necesarios:** `Attempt` activo + `Draft` vigente + `AcademyUnit` asociada, resueltos en la proyección.
- **Proyecciones:** una fila o vacío.
- **Consultas optimizadas:** un único acceso al Read Model.

**(D) Checklist**
✅ Domain Model (A-06) · ✅ Functional Specification · ✅ API Contract (`EP-14`) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven (N/A) · ✅ No modifica A-01–A-10.

---

### QRY-04 — GetAttemptHistory

**(A) Especificación**
- **Propósito:** listar todos los Intentos (original y repeticiones) de una `AcademyUnit`.
- **Filtros:** `unitId` (obligatorio).
- **DTO de salida:** `AttemptSummaryDTO[]`.
- **Paginación:** **PENDIENTE DE DECISIÓN DE ARQUITECTURA** (heredado, sin resolver en este Sprint).
- **Ordenamiento:** cronológico, por `startedAt` ascendente.
- **Autorización:** Estudiante, propietario de la Unidad (RLS).

**(B) Query Handler**
- **Nombre:** `GetAttemptHistoryHandler implements IQueryHandler<GetAttemptHistoryQuery, AttemptSummaryDTO[]>`.
- **Repositorios utilizados:** exclusivamente `AcademyReadModelPort.listAttemptsByUnit(unitId)`.
- **Joins necesarios:** `Attempt` × Unidad, resuelto en la proyección.
- **Proyecciones:** una fila por `Attempt`.
- **Consultas optimizadas:** un único acceso al Read Model.

**(D) Checklist**
✅ Domain Model · ✅ Functional Specification (CU-07) · ✅ API Contract (`EP-16`) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven (N/A) · ✅ No modifica A-01–A-10.

---

### QRY-05 — GetVersionFeedback

**(A) Especificación**
- **Propósito:** obtener el contenido de una `Version` y su `Feedback` asociada.
- **Filtros:** `attemptId` (obligatorio), `versionNumber` (obligatorio).
- **DTO de salida:** `VersionDTO` + `FeedbackDTO`.
- **Paginación:** no aplica (recurso único).
- **Ordenamiento:** no aplica.
- **Autorización:** Estudiante, propietario del `Attempt` (RLS).

**(B) Query Handler**
- **Nombre:** `GetVersionFeedbackHandler implements IQueryHandler<GetVersionFeedbackQuery, { version: VersionDTO; feedback: FeedbackDTO | null }>`.
- **Repositorios utilizados:** exclusivamente `AcademyReadModelPort.getVersionFeedback(attemptId, versionNumber)`.
- **Joins necesarios:** `Version` × `Feedback`, resuelto en la proyección.
- **Proyecciones:** una fila compuesta.
- **Consultas optimizadas:** un único acceso al Read Model.
- **Excepciones:** `ACADEMY_NOT_FOUND_VERSION`.

**(D) Checklist**
✅ Domain Model · ✅ Functional Specification (CU-04) · ✅ API Contract (`EP-18`, corregido R-04) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven (N/A) · ✅ No modifica A-01–A-10.

---

### QRY-06 — ListModelExamplesByTextType

**(A) Especificación**
- **Propósito:** obtener los `ModelExample` disponibles para un `TextType`, usados en los pasos Observar/Analizar.
- **Filtros:** `textType` (obligatorio).
- **DTO de salida:** `ModelExampleDTO[]`.
- **Paginación:** **PENDIENTE DE DECISIÓN DE ARQUITECTURA** (heredado).
- **Ordenamiento:** sin criterio formalmente definido (heredado, no resuelto en este Sprint).
- **Autorización:** Estudiante (sin restricción adicional de propiedad — recurso compartido).

**(B) Query Handler**
- **Nombre:** `ListModelExamplesByTextTypeHandler implements IQueryHandler<ListModelExamplesByTextTypeQuery, ModelExampleDTO[]>`.
- **Repositorios utilizados:** exclusivamente `AcademyReadModelPort.listModelExamplesByTextType(textType)`.
- **Joins necesarios:** ninguno — filtra únicamente por `status: 'ACTIVE'` (los retirados vía `CMD-14` quedan excluidos de esta proyección).
- **Proyecciones:** N filas.
- **Consultas optimizadas:** un único acceso al Read Model, filtrado por índice de `textType`.

**(D) Checklist**
✅ Domain Model · ✅ Functional Specification (CU-08) · ✅ API Contract (`EP-19`, corregido R-04 — antes citaba `QRY-08`, retirada) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven (N/A) · ✅ No modifica A-01–A-10.

---

### QRY-07 — GetStudentProgressSummary

**(A) Especificación**
- **Propósito:** exponer al Profesor el progreso agregado de Academia de un Estudiante (A-10).
- **Filtros:** `studentId` (obligatorio).
- **DTO de salida:** `StudentProgressSummaryDTO`.
- **Paginación:** no aplica (agregado único).
- **Ordenamiento:** no aplica.
- **Autorización:** Profesor, con relación docente-estudiante verificada (`TeacherStudentRelationshipPort`).

**(B) Query Handler**
- **Nombre:** `GetStudentProgressSummaryHandler implements IQueryHandler<GetStudentProgressSummaryQuery, StudentProgressSummaryDTO>`.
- **Repositorios utilizados:** exclusivamente `AcademyReadModelPort.getStudentProgressSummary(studentId)`.
- **Joins necesarios:** agregación de `AcademyUnit` por `UnitState`/`TextType`, resuelta en la proyección.
- **Proyecciones:** una fila agregada.
- **Consultas optimizadas:** un único acceso al Read Model (sin iterar Unidad por Unidad desde Application).
- **Nota de selección múltiple:** cuando el Panel del Profesor requiere progreso de varios estudiantes, el Frontend invoca este Query una vez por `studentId` seleccionado — no existe `Group`/`GroupId` (ACP-001-B).

**(D) Checklist**
✅ Domain Model (A-10) · ✅ Functional Specification (CU-09) · ✅ API Contract (`EP-12`/`EP-20`, corregido R-04) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven (N/A) · ✅ No modifica A-01–A-10.

---

### QRY-09 — GetTeacherOverrideHistory

**(A) Especificación**
- **Propósito:** auditar las anulaciones docentes aplicadas sobre una `AcademyUnit` o un Estudiante.
- **Filtros:** `unitId` o `studentId` (al menos uno).
- **DTO de salida:** `TeacherOverrideDTO[]`.
- **Paginación:** **PENDIENTE DE DECISIÓN DE ARQUITECTURA** (heredado).
- **Ordenamiento:** cronológico, por `appliedAt` descendente (más reciente primero).
- **Autorización:** Profesor, con relación docente-estudiante verificada.
- **Nota de exposición:** sin endpoint de API propio en el API Contract v1.3 vigente — registrado como excepción fuera de alcance (Reconciliación Documental, R-04; Coverage Audit, Matriz C), pendiente de un futuro ACP. El Query existe y es invocable internamente; su exposición pública queda fuera del alcance de este Sprint.

**(B) Query Handler**
- **Nombre:** `GetTeacherOverrideHistoryHandler implements IQueryHandler<GetTeacherOverrideHistoryQuery, TeacherOverrideDTO[]>`.
- **Repositorios utilizados:** exclusivamente `AcademyReadModelPort.listTeacherOverrides(unitId?, studentId?)`.
- **Joins necesarios:** `TeacherOverride` × Unidad/Estudiante, resuelto en la proyección.
- **Proyecciones:** N filas.
- **Consultas optimizadas:** un único acceso al Read Model.

**(D) Checklist**
✅ Domain Model · ✅ Functional Specification (CU-10, auditoría) · ✅ API Contract (sin endpoint — excepción registrada, no BLOCKER) · ✅ Infrastructure Model · ✅ CQRS · ✅ Event-Driven (N/A) · ✅ No modifica A-01–A-10.

---

### QRY-10 — GetStudentUnitHistory

**(A) Especificación**
- **Propósito:** exponer al Profesor, para un estudiante y una unidad específicos, el estado/progreso de la unidad junto con el historial completo de intentos, versiones y retroalimentación (CU-12).
- **Filtros:** `studentId` (obligatorio), `unitId` (obligatorio).
- **DTO de salida:** `StudentUnitHistoryDTO` (compuesto exclusivamente por campos ya existentes en `AttemptSummaryDTO`, `VersionDTO`, `FeedbackDTO` — ningún campo nuevo de dominio).
- **Paginación:** **PENDIENTE DE DECISIÓN DE ARQUITECTURA** (mismo criterio abierto que `QRY-04`, del cual reutiliza el patrón de acceso a intentos por unidad).
- **Ordenamiento:** intentos en orden cronológico; versiones dentro de cada intento por `versionNumber` ascendente.
- **Autorización:** Profesor, con relación docente-estudiante verificada (mismo mecanismo que `EP-07`/`EP-08`/`EP-20`).

**(B) Query Handler**
- **Nombre:** `GetStudentUnitHistoryHandler implements IQueryHandler<GetStudentUnitHistoryQuery, StudentUnitHistoryDTO>`.
- **Repositorios utilizados:** exclusivamente `AcademyReadModelPort.getStudentUnitHistory(studentId, unitId)` — ningún Repository de escritura, ningún Aggregate cargado.
- **Joins necesarios:** `AcademyUnit` (estado/progreso) × `Attempt` (todos los intentos de esa unidad para ese estudiante) × `Version` × `Feedback`, resueltos íntegramente en la proyección.
- **Proyecciones:** una fila compuesta (unidad + arreglo de intentos, cada uno con sus versiones y retroalimentación).
- **Consultas optimizadas:** un único acceso al Read Model, sin N+1 pese a la profundidad de la composición (proyección ya desnormalizada a nivel de Infrastructure).
- **Excepciones:** `ACADEMY_NOT_FOUND_UNIT` (unidad inexistente o sin ningún intento del estudiante — distinto de "unidad con cero intentos", que retorna `200 OK` con arreglo vacío, per `EP-23`).

**(D) Checklist**
✅ Domain Model (ningún Repository ni Aggregate nuevo, Entities ya incluidas en `Attempt`) · ✅ Functional Specification (CU-12, v1.3) · ✅ API Contract (`EP-23`) · ✅ Infrastructure Model · ✅ CQRS (lectura pura) · ✅ Event-Driven (N/A) · ✅ No modifica A-01–A-10.

---

## 9. Casos de Uso (CU-01 a CU-12)

Cada Caso de Uso se documenta con su secuencia completa de Commands/Queries, el Aggregate afectado, los eventos de dominio emitidos y la forma de la respuesta — sin introducir ningún paso, actor o comportamiento no ya definido en la Functional Specification v1.3/Domain Model v1.1.

### CU-01 — Iniciar unidad
- **Secuencia:** Estudiante selecciona una `AcademyUnit` elegible → `CMD-01 StartUnit`.
- **Command/Query involucrado:** `CMD-01`.
- **Aggregate:** `AcademyUnit` (lectura de elegibilidad vía `EligibleForUnlockSpecification`) → `Attempt` (creación vía `AttemptFactory`).
- **Eventos:** `UnitStarted`.
- **Respuesta:** `AttemptSummaryDTO` del nuevo `Attempt`, `currentStep = CONTEXTUALIZE`.

### CU-02 — Recorrer pasos previos a la producción (incl. verificación de comprensión)
- **Secuencia:** Estudiante avanza secuencialmente → `CMD-16 AdvanceStep` (repetido para `CONTEXTUALIZE → DEFINE_OBJECTIVES → OBSERVE → ANALYZE → PRACTICE`, con `QRY-06 ListModelExamplesByTextType` invocado en los pasos `OBSERVE`/`ANALYZE`) → al llegar a `COMPREHEND`, `CMD-17 VerifyComprehension` (reintentable hasta verificación satisfactoria).
- **Command/Query involucrado:** `CMD-16`, `CMD-17`, `QRY-06` (consulta de apoyo).
- **Aggregate:** `Attempt`.
- **Eventos:** ninguno (mismo criterio de granularidad que `CMD-03`).
- **Respuesta:** `AttemptSummaryDTO` actualizado en cada paso; al completar `COMPREHEND`, `currentStep = OBSERVE`.

### CU-03 — Producir y enviar primera versión
- **Secuencia:** Estudiante redacta (autoguardado periódico vía `CMD-03 AutosaveDraft`) → envía → `CMD-02 SubmitProduction`.
- **Command/Query involucrado:** `CMD-03` (repetido), `CMD-02`.
- **Aggregate:** `Attempt` (`Draft` → `Version`).
- **Eventos:** `ProductionSubmitted`, `FeedbackRequested`.
- **Respuesta:** `VersionDTO` de la `Version` creada.

### CU-04 — Recibir retroalimentación
- **Secuencia:** Coach IA entrega retroalimentación (fuera del alcance de Application, vía `FeedbackGateway`) → `CMD-04 RecordFeedbackDelivered` → Estudiante consulta → `QRY-05 GetVersionFeedback`.
- **Command/Query involucrado:** `CMD-04`, `QRY-05`.
- **Aggregate:** `Attempt` (`Feedback`).
- **Eventos:** `FeedbackDelivered`.
- **Respuesta:** `VersionDTO` + `FeedbackDTO`.

### CU-05 — Reescribir
- **Secuencia:** Estudiante envía una nueva versión tras recibir retroalimentación → `CMD-05 SubmitRevision`.
- **Command/Query involucrado:** `CMD-05`.
- **Aggregate:** `Attempt` (`Version` adicional).
- **Eventos:** `RevisionStarted`, `ProductionSubmitted`, `FeedbackRequested` (misma invocación, orquestación ya aprobada — H-04/R-06).
- **Respuesta:** `VersionDTO` de la nueva `Version`.

### CU-06 — Reflexionar y completar unidad
- **Secuencia:** Estudiante avanza a reflexión → `CMD-06 AdvanceToReflection` → completa reflexión → `CMD-07 CompleteReflection` (transacción 1 sobre `Attempt`; transacción 2, vía event handler, sobre `AcademyUnit`).
- **Command/Query involucrado:** `CMD-06`, `CMD-07`.
- **Aggregate:** `Attempt` → `AcademyUnit` (dos transacciones separadas, Sección 3).
- **Eventos:** `ReflectionStarted`, `ReflectionCompleted`, `UnitCompleted`, condicionalmente `UnitUnlocked` (siguiente Unidad), condicionalmente `EXTERNAL_ACTIVITY_COMPLETED` (RN-9).
- **Respuesta:** `AcademyUnitDetailDTO` actualizado (`state = COMPLETED`).

### CU-07 — Repetir unidad completada
- **Secuencia:** Estudiante repite una Unidad ya `COMPLETED`/`MASTERED` elegible → `CMD-09 RepeatUnit`. Independientemente, tras cada `UnitCompleted`, el sistema puede evaluar dominio → `CMD-08 EvaluateMastery` (narrado en la Functional Spec, punto 10, no encadenado directamente a `CMD-09`).
- **Command/Query involucrado:** `CMD-09` (+ `CMD-08`, evaluación independiente).
- **Aggregate:** `AcademyUnit`.
- **Eventos:** `UnitRepeated` (vía `CMD-09`); `UnitMastered` (vía `CMD-08`, si aplica).
- **Respuesta:** `AcademyUnitDetailDTO` actualizado.

### CU-08 — Consultar Biblioteca de Modelos
- **Secuencia:** Estudiante consulta modelos por tipo de texto → `QRY-06 ListModelExamplesByTextType`. (Gestión editorial, Administrador: `CMD-12`/`CMD-13`/`CMD-14`, fuera de esta narrativa de Estudiante.)
- **Command/Query involucrado:** `QRY-06`.
- **Aggregate:** `ModelExample` (lectura de proyección, sin carga del Aggregate).
- **Eventos:** ninguno.
- **Respuesta:** `ModelExampleDTO[]`.

### CU-09 — Revisar progreso agregado (Profesor)
- **Secuencia:** Profesor selecciona uno o varios estudiantes (selección múltiple orquestada por el Frontend, sin `Group`) → `QRY-07 GetStudentProgressSummary` (una invocación por estudiante).
- **Command/Query involucrado:** `QRY-07`.
- **Aggregate:** ninguno (lectura de proyección agregada).
- **Eventos:** ninguno.
- **Respuesta:** `StudentProgressSummaryDTO` (por estudiante).

### CU-10 — Forzar bloqueo o reinicio
- **Secuencia:** Profesor aplica una anulación sobre la Unidad de un estudiante → `CMD-10 ApplyTeacherOverride` (internamente reutiliza `unit.repeat()` si la acción es `FORCE_RESTART`).
- **Command/Query involucrado:** `CMD-10`.
- **Aggregate:** `AcademyUnit` (`TeacherOverride`).
- **Eventos:** `TeacherOverrideApplied`.
- **Respuesta:** `TeacherOverrideDTO` + `AcademyUnitDetailDTO` actualizado.

### CU-11 — Recomendar unidad
- **Secuencia:** Profesor selecciona una Unidad y uno o varios estudiantes destinatarios (selección múltiple orquestada por el Frontend, sin `Group`) → `CMD-11 AssignUnitToStudent` (una invocación por estudiante).
- **Command/Query involucrado:** `CMD-11`.
- **Aggregate:** ninguno (deliberado, resolución ARB).
- **Eventos:** ninguno.
- **Respuesta:** `TeacherRecommendationDTO`.

### CU-12 — Revisar historial académico detallado de un estudiante (Profesor)
- **Secuencia:** Profesor selecciona un estudiante y una Unidad → `QRY-10 GetStudentUnitHistory`.
- **Command/Query involucrado:** `QRY-10`.
- **Aggregate:** ninguno (lectura de proyección compuesta, sin carga de `AcademyUnit`/`Attempt`).
- **Eventos:** ninguno.
- **Respuesta:** `StudentUnitHistoryDTO`.

**Nota de exclusión (Administrador):** `CMD-12` (CreateModelExample), `CMD-13` (UpdateModelExample) y `CMD-14` (RetireModelExample) no se documentan como CU-xx numerados independientes, consistente con F-03 de la Coverage Audit (impacto Bajo, no bloqueante, ya registrado, no resuelto en este Sprint por no formar parte del alcance autorizado). `CMD-15` (`ProvisionAcademyUnitsForStudent`) tampoco traza a ningún CU-xx explícito, consistente con F-04 (mismo criterio).

---

## 10. Verificación Final de Cierre del Documento

| Verificación | Resultado |
|---|---|
| Functional Specification (Frozen) sin modificar | ✅ Cumple |
| Domain Model v1.1 (Frozen) sin modificar | ✅ Cumple |
| Aggregate Roots (`AcademyUnit`, `Attempt`, `ModelExample`) sin modificar | ✅ Cumple |
| Entities (`Draft`, `Version`, `Feedback`, `TeacherOverride`) sin modificar | ✅ Cumple |
| Value Objects sin modificar | ✅ Cumple |
| Domain Events (13) sin modificar ni inventados | ✅ Cumple — ningún Command de este documento emite un evento no ya Frozen |
| Policies (7) sin modificar, invocadas exclusivamente por su Aggregate designado (Tell-Don't-Ask, H-02) | ✅ Cumple |
| Specifications (3) sin modificar | ✅ Cumple |
| Domain Services (`MasteryEvaluationService`, `UnitSequenceService`) sin modificar | ✅ Cumple |
| Factories (`AcademyUnitFactory`, `AttemptFactory`) sin modificar | ✅ Cumple |
| Máquina de estados (`UnitState`, `UnitStep`) sin modificar | ✅ Cumple |
| Invariantes (11 + Sección 8.1) sin modificar | ✅ Cumple |
| RN-1 a RN-17 sin modificar | ✅ Cumple |
| A-01 a A-10 sin modificar | ✅ Cumple |
| ACP aprobados sin modificar | ✅ Cumple |
| API Contract v1.3 sin modificar | ✅ Cumple — este documento solo tipa y referencia sus DTOs/endpoints, no redefine su forma |
| Infrastructure Model v1.1 sin modificar | ✅ Cumple — Repository Interfaces de la Sección 2 reutilizan exactamente los métodos ya nombrados ahí |
| CQRS preservado (Commands mutan vía Aggregate+Repository; Queries leen exclusivamente vía `AcademyReadModelPort`) | ✅ Cumple, verificado Command por Command y Query por Query |
| Arquitectura Event-Driven preservada (Outbox, "dos transacciones", at-least-once) | ✅ Cumple |
| Clean Architecture (dependencia `infrastructure → application → domain`, puertos definidos por Application) | ✅ Cumple |
| Tell-Don't-Ask (ningún Handler muta campos de Aggregate directamente) | ✅ Cumple |
| No se incluyó ningún Controller, Prisma, SQL, infraestructura de base de datos, Next.js, Frontend ni Swagger | ✅ Cumple |
| Los 17 Commands (CMD-01 a CMD-17) están completamente especificados | ✅ Cumple |
| Las 9 Queries activas (QRY-01 a QRY-07, QRY-09, QRY-10) están completamente especificadas; `QRY-08` excluida por retiro formal | ✅ Cumple |
| Los 12 Casos de Uso (CU-01 a CU-12) están documentados con secuencia completa | ✅ Cumple |

**Elementos heredados como PENDIENTE DE DECISIÓN DE ARQUITECTURA (no resueltos por este Sprint, no BLOCKER):** mecanismo de paginación (`QRY-04`, `QRY-06`, `QRY-09`, `QRY-10`); mecanismo exacto de verificación de relación docente-estudiante (`TeacherStudentRelationshipPort`); disparador exacto de `CMD-15`; forma exacta de `comprehensionResponse` (`CMD-17`); clave de deduplicación exacta de `CMD-04`; mecanismo de protección ante doble clic de `CMD-10`; garantías de entrega hacia otros Bounded Context. Ninguno de estos pendientes bloquea la especificación de la Application Layer entregada en este documento — todos estaban ya registrados como tales en el Application Model v1.4/Infrastructure Model v1.1, sin agravarse ni resolverse aquí.

**Veredicto final:** documento completo, sin BLOCKER detectado en ningún punto del Sprint. Los 17 Commands, las 9 Queries activas y los 12 Casos de Uso quedan especificados a nivel de contrato TypeScript, Handler, Validator, Repository Interface, Mapper, Unit of Work y catálogo de errores — listo para servir de base a la generación de código NestJS en el Sprint siguiente, sin necesidad de reabrir ninguna decisión ya Frozen/Aprobada.

---
