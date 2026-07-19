# Sprint 3.3.3 — Application Layer de Mi Plan — Informe de entrega

**Fecha:** 2026-07-18
**Alcance:** `features/my-plan/application/` (86 archivos: 76 de código + 10 de test) y `tests/unit/my-plan/application/`.
**No se modificó:** Domain Layer (Sprint 3.3.2), Prisma, migraciones, RLS, Dashboard ni ningún otro módulo.

## 1. Resumen ejecutivo

Se implementó la Application Layer completa del módulo Mi Plan: 14 casos de uso materializados como Command/Query + Handler, 6 puertos base (`UnitOfWork`, `EventBus`, `Clock`, `UuidGenerator`, `TransactionManager`, `Logger`) más 3 puertos de lectura CQRS, 10 DTO (Request/Response separados), 6 Mappers dominio→DTO, 6 módulos de validación sintáctica, 5 excepciones de aplicación y 2 servicios de aplicación (`OwnershipVerificationService`, `DomainEventPublisher`). El caso **UpdateLearningPlan** no se implementó: el dominio no expone ningún mutador de campos escalares y añadirlo habría exigido modificar el Domain Layer, explícitamente prohibido este sprint — se reporta como bloqueado en la sección 11. Durante la verificación con tests reales se detectó y corrigió un defecto de coordinación en `CompleteLearningTaskHandler` (ver sección 9). `tsc --strict` (0 dependencias externas) y la suite completa (83/83, incluidas las 55 pruebas de dominio ya existentes) pasan sin errores. `git status` detectó los 86 archivos nuevos; quedaron en staging, sin commit.

## 2. Casos de uso implementados

De los 15 solicitados, 14 quedaron completos y 1 bloqueado:

| # | Caso de uso | Estado |
|---|---|---|
| 1 | CreateLearningPlan | ✅ |
| 2 | UpdateLearningPlan | 🔴 Bloqueado (ver sección 11) |
| 3 | PauseLearningPlan | ✅ |
| 4 | ResumeLearningPlan | ✅ |
| 5 | CancelLearningPlan | ✅ |
| 6 | CompleteLearningTask | ✅ |
| 7 | UpdateLearningObjective | ✅ (interpretado como transición de estado, ver sección 11) |
| 8 | CreateStudySession | ✅ |
| 9 | UpdateStudySchedule | ✅ |
| 10 | RequestPlanReorganization | ✅ |
| 11 | GetActiveLearningPlan | ✅ |
| 12 | GetDailyPlan | ✅ (CQRS read port, ver sección 11) |
| 13 | GetWeeklyPlan | ✅ (CQRS read port) |
| 14 | GetLearningProgress | ✅ (CQRS read port) |
| 15 | GetStudySchedule | ✅ |

## 3. DTOs creados

10 archivos en `dto/`, cada uno con Request y Response separados (nunca se expone una Entity de dominio): `LearningPlanDto` (+ `InitialLearningGoalRequestDto`/`InitialStudyScheduleRequestDto`), `LearningGoalDto`, `LearningObjectiveDto`, `LearningTaskDto`, `StudyScheduleDto`, `StudySessionDto`, `PlanReorganizationDto`, `DailyPlanDto`, `WeeklyPlanDto`, `LearningProgressDto`. Fechas siempre `string` ISO-8601, nunca `Date`.

## 4. Commands y Queries

9 Commands (`commands/`) y 5 Queries (`queries/`), cada uno una clase con constructor privado y `static fromRequest(request)` — separación CQRS explícita, sin lógica propia (solo envuelven el DTO de entrada ya validado por el Handler).

## 5. Handlers

14 Handlers en `handlers/`, uno por Command/Query, cada uno coordinando exclusivamente Repositories, entidades de dominio, Domain Services (`AutoCompletionStatusCalculator` vía `recalculateStatus()`), `UnitOfWork` y publicación de eventos — ninguna regla de negocio vive en un Handler. Política única de publicación de eventos: siempre **después** de que `unitOfWork.execute()` resuelve (nunca dentro), aplicada de forma consistente en `CreateLearningPlanHandler` y `CompleteLearningTaskHandler` (únicos dos que publican eventos, porque `LearningPlan`/`LearningTask` son los únicos Aggregate Roots).

## 6. Puertos definidos

`ports/`: `UnitOfWork`, `TransactionManager`, `EventBus`, `Clock`, `UuidGenerator`, `Logger` (los 6 exigidos) + `DailyPlanReadPort`, `WeeklyPlanReadPort`, `LearningProgressReadPort` (3 puertos de lectura CQRS adicionales, justificados en la sección 11). Todos son interfaces puras — ninguna implementación.

## 7. Excepciones

`exceptions/`: `ApplicationException` (abstracta, base), `ResourceNotFoundException`, `ConflictException`, `ValidationException`, `ForbiddenException`. Ninguna reutiliza una excepción de dominio; los Handlers traducen explícitamente `InvalidStatusTransitionException`/`InvalidTaskSourceOperationException` (dominio) a `ConflictException` (aplicación) en cada `try/catch`.

## 8. Pruebas ejecutadas

83/83 pasando (`npx vitest run`, entorno aislado `/tmp/domain-test`, sin infraestructura real):

- 55 pruebas de dominio ya existentes (Sprint 3.3.2), sin modificar.
- 28 pruebas nuevas de aplicación en 8 archivos (`tests/unit/my-plan/application/`), mockeando Repositories/EventBus/UnitOfWork/Clock/Logger/UuidGenerator con `vi.fn()` — cero Prisma, cero infraestructura real. Cobertura: creación de plan (éxito, conflicto de plan activo duplicado, validación fallida), pausa/reanudación/cancelación (éxito, no encontrado, no propietario, transición inválida), completar tarea (éxito con recálculo de fase, guarda de `source`, no propietario), actualizar objetivo (transición válida con recálculo de meta, transición inválida), crear sesión de estudio, actualizar horario (éxito, no propietario, sin horario), solicitar reorganización (éxito sin persistencia, no propietario), y los 5 Handlers de consulta (incluidos los 3 basados en puertos de lectura CQRS).

## 9. Resultado de compilación

`tsc --strict` sobre `features/my-plan/domain/**/*.ts` + `features/my-plan/application/**/*.ts` (194 archivos, `noUncheckedIndexedAccess`, `noImplicitOverride`, sin `@types/node` ni ninguna dependencia externa, solo alias `@/*` resuelto contra la raíz del repo): **0 errores**.

**Defecto detectado y corregido durante la verificación con tests reales** (no durante la revisión estática): `CompleteLearningTaskHandler` invocaba `task.complete()` directamente sobre una tarea recién creada (`NOT_STARTED`), pero 18.21 exige la transición intermedia `NOT_STARTED -> IN_PROGRESS` antes de `-> COMPLETED` — el dominio la rechazaba con `InvalidStatusTransitionException`. Como el encargo no incluye un caso de uso "StartLearningTask" independiente, se corrigió el Handler para invocar `task.start()` (método de dominio ya existente, sin ningún cambio) inmediatamente antes de `task.complete()`, únicamente si la tarea sigue `NOT_STARTED` — coordinación de una secuencia de dos métodos de dominio ya aprobados, no una regla nueva. Aprovechando la misma corrección se unificó también la política de publicación de eventos de este Handler (antes publicaba dentro de `unitOfWork.execute()`, ahora después, igual que `CreateLearningPlanHandler`).

## 10. Resultado de git status

Antes de `git add`: `git status --porcelain` mostró exactamente 2 entradas (`?? features/my-plan/application/`, `?? tests/unit/my-plan/application/`) — Git detectó correctamente el trabajo nuevo, sin desfase entre el repositorio real y el mirror del usuario (`diff -rq` entre ambos, excluyendo `.git`/`node_modules`/artefactos de build, devolvió vacío). Se ejecutó `git add` sobre ambas rutas: 86 archivos quedaron en staging (`git diff --cached --stat`: 86 files changed, 3040 insertions). **No se realizó commit, push ni se crearon tags.**

## 11. Riesgos pendientes

1. **UpdateLearningPlan bloqueado** — el dominio (`LearningPlan`, Sprint 3.3.2) solo expone transiciones de estado (`pause()`/`resume()`/`cancel()`), ningún mutador de `name`/`description`/`targetLevel`/`endDate`. Implementarlo exige decidir primero, a nivel de dominio, qué campos son editables y bajo qué invariantes — fuera de alcance de este sprint ("No modificar Domain Layer"). Requiere una decisión de arquitectura explícita antes del próximo sprint.
2. **UpdateLearningObjective interpretado como transición de estado** — el dominio no expone un mutador de `title`/`description` para `LearningObjective` (mismo patrón que el riesgo 1, a menor escala). Se interpretó "Update" como las 4 transiciones (`START`/`COMPLETE`/`REVERT`/`CANCEL`) porque es la única superficie que el dominio ofrece y porque el propio encargo no incluye un caso de uso separado "CompleteLearningObjective". Riesgo bajo, pero es una interpretación, no un requisito literal.
3. **3 puertos de lectura CQRS sin Entity de dominio** — `DailyPlanReadPort`/`WeeklyPlanReadPort`/`LearningProgressReadPort` devuelven DTOs de lectura directamente porque `DailyPlan`/`WeeklyPlan`/`LearningProgress` fueron deliberadamente excluidas del Domain Layer en el Sprint 3.3.2 (resúmenes agregados de solo lectura, sin comportamiento propio). Es una separación Command/Query legítima, explícitamente permitida por el encargo ("CQRS cuando aplique"), pero implica que esas 3 consultas nunca pasarán por un Aggregate Root — debe confirmarse que la futura capa de infraestructura las materialice como vistas/consultas agregadas coherentes con `learning_plan_id`.
4. **Ningún caso de uso "StartLearningTask"/"StartLearningObjective" explícito** — `CompleteLearningTaskHandler` ahora invoca `task.start()` implícitamente (ver sección 9); `UpdateLearningObjectiveHandler` expone `START` como una de las 4 acciones. La asimetría (uno implícito, otro explícito) es consecuencia directa de que el encargo solo nombra "CompleteLearningTask" para `LearningTask` pero "UpdateLearningObjective" (genérico) para `LearningObjective`. Documentado, no oculto, pero vale la pena homogeneizar en un futuro sprint de revisión.
5. **RequestPlanReorganizationHandler no dispara ningún cambio de dominio por sí mismo** — solo valida propiedad y publica el evento; el cambio real (nueva disponibilidad vía `UpdateStudySchedule`, o nueva fecha de examen vía el `UpdateLearningPlan` bloqueado) debe haber ocurrido en una llamada previa del cliente. No hay garantía transaccional entre ambas llamadas — a evaluar si el futuro Learning Planner debe tolerar reorganizaciones "huérfanas" (evento publicado sin cambio de datos real, p. ej. por doble clic del cliente).

## 12. Veredicto

🟡 **REQUIERE AJUSTES** — la Application Layer está completa, compila en modo estricto sin dependencias externas, y 83/83 pruebas (55 de dominio + 28 nuevas) pasan mockeando todos los puertos. Se marca 🟡 y no 🟢 porque 1 de los 15 casos de uso (`UpdateLearningPlan`) quedó explícitamente bloqueado por una limitación real del Domain Layer (riesgo 1) — ajuste pendiente: decisión de arquitectura sobre qué campos de `LearningPlan` son editables, antes de poder cerrar ese caso de uso en un sprint posterior.
