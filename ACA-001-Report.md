ACA-001 REPORT

## Resumen Ejecutivo

La implementación de la API Layer de Academia (Sprint 6.3) cumple parcialmente con el Contrato y con Clean Architecture, pero presenta un hallazgo de seguridad de severidad BLOCKER (exposición cross-estudiante de datos vía IDOR en EP-14) y tres hallazgos CRITICAL que comprometen la pureza arquitectónica declarada (Service Locator sistemático, acceso directo de la capa API a Domain/Repository en EP-03, y un bypass de CQRS en EP-12). Los Request/Response Mappers son puros y no contienen lógica de negocio. El compilador TypeScript (strict) no reporta errores nuevos. El sistema NO está listo para Sprint 6.4 sin remediar, como mínimo, el hallazgo BLOCKER.

## Resultado General

Architecture Compliance Score: 38/100

### Clean Architecture — FAIL

### DDD — FAIL

### CQRS — FAIL

### SOLID — FAIL

### API Contract — FAIL

### OpenAPI — PASS

### Security — FAIL

### Performance — FAIL

---

## Hallazgos

### BLOCKER

**H-01 — IDOR / ausencia total de control de propiedad en EP-14 (GetAcademyUnitDetail).**
`features/academy/api/handlers/unitsHandlers.ts::handleGetUnitDetail` solo invoca `await resolveAcademyActor()` (autenticación) — nunca llama `requireRole()` ni ninguna verificación de propiedad sobre `unitId`. La cadena continúa en `features/academy/application/handlers/GetAcademyUnitDetailHandler.ts::handle()`, que tampoco verifica ownership: llama directo a `this.readModelPort.getUnitDetail(request.unitId)`. La implementación real, `features/academy/infrastructure/persistence/read-models/PrismaAcademyReadModelPort.ts::getUnitDetail()` (líneas 75-97), ejecuta `client.academyUnit.findUnique({ where: { id: unitId } })` — **sin `studentId` en el `WHERE`** — bajo `withActiveClient()`, que además cae a `withServiceContext()` (rol `dashboard_service_role`, RLS bypasseado) porque ningún Query Handler envuelve su llamada en `UnitOfWork.execute()`. Resultado demostrado por lectura de código: cualquier STUDENT autenticado puede leer el detalle completo de **cualquier** `AcademyUnit` de **cualquier otro estudiante** con solo conocer o enumerar un `unitId` válido. No existe ninguna capa (API, Application, ni base de datos vía RLS) que detenga esto.

### CRITICAL

**H-02 — Service Locator sistemático en toda la capa de Handlers.**
`createAcademyContainer()` se invoca 24 veces dentro de los 6 archivos de `handlers/*.ts` (`unitsHandlers.ts`, `attemptsHandlers.ts`, `modelExamplesHandlers.ts`, `teacherHandlers.ts`, `progressHandlers.ts`, `healthHandlers.ts`), resolviendo dependencias en cada llamada individual en vez de recibir un contenedor ya compuesto por inyección. Esto contradice explícitamente el requisito del encargo ("que no exista Service Locator") y el propio comentario de cabecera de `composition/academyContainer.ts`, que invoca el principio de Composition Root de Mark Seemann pero no lo aplica: el contenedor se memoiza a nivel de módulo (`cachedContainer`) y se recupera vía llamada a función desde dentro de cada handler, que es la definición operativa de Service Locator, no de Composition Root/DI.

**H-03 — La capa API invoca directamente un Value Object y un Repository de Domain, saltándose Application.**
`features/academy/api/handlers/attemptsHandlers.ts::handleSubmitVersion` (EP-03, líneas 96-124) importa `AttemptId` (Domain Value Object) y ejecuta `container.repositories.attempt.findById(AttemptId.create(attemptId))` directamente desde el Handler HTTP, envuelto solo en `unitOfWork.execute(...)`. El resultado (`existing.versions.length > 0`) se usa para tomar una decisión de negocio — qué Command Handler de Application invocar (`submitProduction` vs `submitRevision`). Esto es una violación de Clean Architecture (Presentation → Domain/Infrastructure sin pasar por Application) y de SRP (el Handler HTTP concentra lógica de despacho de negocio). Es además una lectura redundante: `SubmitProductionHandler`/`SubmitRevisionHandler` (Application) ya ejecutan su propio fetch de ownership vía `assertAttemptOwnership`. La misma lógica de despacho está duplicada en `features/academy/actions/attemptActions.ts::submitVersionAction` (ver H-10).

**H-04 — Bypass de CQRS en EP-12 (GetMyProgressSummary): dos rutas de código divergentes hacia la misma lectura.**
`features/academy/api/handlers/progressHandlers.ts::handleGetMyProgressSummary` llama directamente `container.ports.readModel.getStudentProgressSummary(actor.userId)`, evitando por completo `GetStudentProgressSummaryHandler` (el Query Handler real de Application, usado en cambio por EP-20 vía `teacherHandlers.ts`). Existen ahora dos caminos de código independientes hacia el mismo dato — uno que pasa por el Query Handler de Application (con su propia validación) y otro que no — lo que contradice el principio de que el acceso al Read Model debe canalizarse exclusivamente a través de un Query Handler, y crea riesgo de divergencia de comportamiento entre EP-12 y EP-20 a futuro.

### MAJOR

**H-05 — Idempotency-Key: solo se valida presencia, no existe deduplicación real.**
`features/academy/api/http/idempotency.ts::requireIdempotencyKey()` valida únicamente que el header exista y no esté vacío. No existe almacén de claves procesadas ni ventana de 24h. Reintentos legítimos de cliente (timeout, retry automático) pueden duplicar efectos de negocio en los endpoints POST que el contrato marca como creadores de recursos con efecto (EP-01, EP-03, EP-06, EP-07, EP-08, EP-09, EP-22). Disclosed en comentario del propio archivo, pero constituye un incumplimiento activo del contrato, no solo una limitación documentada.

**H-06 — Fuga de información en la rama de error 500 genérica.**
`features/academy/api/http/errors.ts::mapErrorToHttp`, rama final (líneas 62-70), retorna `details.error: String(error instanceof Error ? error.message : error)` para cualquier excepción no reconocida como `ApplicationException` — incluyendo errores crudos de Prisma, `SyntaxError` de parseo JSON, o cualquier excepción de infraestructura no anticipada. Esto expone detalles internos (mensajes de driver de base de datos, rutas, nombres de columnas) directamente al cliente HTTP.

**H-07 — `request.json()` sin manejo de error: JSON malformado produce 500 en vez de 400.**
Ocho sitios de llamada (`attemptsHandlers.ts` x4, `modelExamplesHandlers.ts` x2, `teacherHandlers.ts`, `unitsHandlers.ts`) ejecutan `await request.json()` sin try/catch propio. Un body malformado lanza un `SyntaxError` nativo, que no es instancia de `ValidationException` ni de ninguna subclase de `ApplicationException`; cae en el branch genérico de `mapErrorToHttp` (H-06), produciendo 500 en vez del 400 que exige el contrato para errores sintácticos del borde de la API.

**H-08 — Orden invertido: autorización (`requireRole`) se ejecuta antes que la validación de formato.**
En la generalidad de los handlers (ejemplo: `handleStartUnit`, `handleRepeatUnit`, `handleListUnits`) el patrón es `resolveAcademyActor()` → `requireRole()` → construcción del Command/Query → `validate*Request()` (esta última, dentro de Application, vía `Command.fromRequest`). La validación sintáctica (formato de UUID, campos requeridos) ocurre así **después** de la comprobación de autorización, en lugar de antes — invirtiendo el orden que la Sección de Error Mapping del contrato describe implícitamente (validación sintáctica = 400, se resuelve antes que autorización = 401/403).

**H-09 — Instanciación directa de Infraestructura fuera del Composition Root en logging.**
`features/academy/api/http/logging.ts` línea 7: `const logger = new AcademyConsoleLogger();` construye su propia instancia de Infrastructure a nivel de módulo, independiente de `ports.logger` ya compuesta en `composition/academyContainer.ts` (líneas 198-206, reutilizada allí en más de 12 sitios internos). El logging de request/response de la capa HTTP (`logRequestStart/Completed/Failed`) usa así una instancia distinta a la que usan los Handlers/Command Handlers de Application, duplicando lo que el Composition Root ya construye — mismo anti-patrón que H-02, aplicado ahora a Logging.

**H-10 — Duplicación de lógica de negocio entre Route Handlers y Server Actions (violación DRY).**
`features/academy/actions/attemptActions.ts::submitVersionAction` reimplementa la misma lógica de despacho `hasProduction = existing.versions.length > 0` que `handleSubmitVersion` (H-03). `features/academy/actions/unitActions.ts::startUnitAction` reimplementa la misma lógica de recuperación ante conflicto (`catch` de `ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE` seguido de `getAttemptHistory`) que `handleStartUnit`. Existen así dos implementaciones independientes de las mismas reglas, con riesgo real de divergencia si una se corrige y la otra no.

### MINOR

**H-11 — Fan-out N+1 en EP-19 (ListModelExamples) cuando `textType` se omite.**
`features/academy/api/handlers/modelExamplesHandlers.ts::handleListModelExamples` ejecuta, cuando el cliente no envía `textType`, cinco llamadas independientes a `queryHandlers.listModelExamplesByTextType.handle()` (una por cada valor de `TextType`, vía `Promise.all`) en lugar de una sola consulta sin filtro a nivel de Read Model. Es un patrón N+1 de alcance fijo (5x), no escalará si se agregan más `TextType`.

**H-12 — `modelExamplesHandlers.ts` importa el enum `TextType` de Domain directamente.**
Se usa para construir `ALL_TEXT_TYPES` (fan-out de H-11). Es una dependencia directa de Presentation sobre un tipo de Domain, en lugar de un tipo/DTO de Application — menor, dado que es un enum de solo datos, pero es una desviación de la regla de dirección de dependencias declarada.

**H-13 — `healthHandlers.ts` importa Infrastructure directamente, saltándose Composition Root.**
`runAcademyHealthChecks`, `checkDatabaseHealth`, `checkConfigurationHealth` y `loadAcademyInfrastructureConfig` se importan directo desde `features/academy/infrastructure/*` en `handlers/healthHandlers.ts`, sin pasar por `createAcademyContainer()`. Es una excepción no declarada a la regla de capas — comúnmente aceptada en la industria para endpoints de salud, pero no documentada como excepción explícita en este proyecto.

**H-14 — Telemetría sin campo `Handler` distinto pese a exigencia explícita del encargo.**
`features/academy/api/http/telemetry.ts::AcademyTelemetryEntry` registra `endpoint`, `method`, `status`, `durationMs`, `at` — pero el Alcance #10 del encargo pide explícitamente registrar "Request duration, Handler, Endpoint, Status" como campos separados. No hay forma de saber, a partir de la telemetría, qué función handler específica sirvió una solicitud cuando el `endpoint` no basta para distinguirlo (no aplica hoy porque hay 1:1, pero es una desviación literal del requisito).

**H-15 — Discrepancia entre "22 endpoints" (encargo) y 23 endpoints de negocio reales (Contract/OpenAPI).**
El OpenAPI (`academy.openapi.json`) define 22 *paths* únicos, pero 23 *operaciones* de negocio (algunas rutas comparten path con 2 métodos: `/units/{unitId}/attempts`, `/model-examples`, `/attempts/{attemptId}/draft`), más 3 operaciones de Health. El encargo de auditoría pide una matriz de "22 endpoints" — no reconciliado; se documenta aquí para trazabilidad, sin evidencia adicional del Contract v1.3 fuente que permita determinar cuál de los dos números es el autoritativo.

### OBSERVATIONS

**O-01.** Los adaptadores de gap-fill (`TeacherStudentRelationshipAdapter.hasRelationship()` → siempre `false`; `MiPlanTaskLookupAdapter.findLinkedTaskId()` → siempre `null`; `CompetencyEvidenceAdapter.getEvidence()` → snapshot fijo que nunca satisface `MasteryCriterion.isSatisfied()`) son fail-closed/conservadores por diseño — seguros por defecto, pero representan capacidad de negocio no funcional hasta que exista Infrastructure real.

**O-02.** `AcademyUnitCatalogAdapter.listCurriculum()` retorna solo 1 posición por `TextType` (5 entradas totales) — dataset mínimo, no un currículo real.

**O-03.** No existe columna `role` en el modelo `User` de Prisma; todo el sistema de roles (`STUDENT`/`TEACHER`) descansa en `sessionClaims`/`publicMetadata` de Clerk, con fallback a `STUDENT`. Es un vacío de plataforma preexistente, no exclusivo de esta capa API, pero condiciona la solidez de todo `requireRole()`.

**O-04.** `ApplyTeacherOverrideHandler` (Application) invoca `unitOfWork.execute(...)` sin pasar `studentId`, cayendo a `withServiceContext` (RLS bypass). Es un hallazgo de capa Application, fuera del alcance declarado de este audit (API Layer) — se deja registrado para trazabilidad futura.

**O-05.** Los Request/Response Mappers (`request-mappers/*.ts`, `response-mappers/*.ts`) se verificaron sin llamadas a `container`, Repository, Handler ni `Prisma` — son funciones puras de transformación, consistente con el requisito de pureza.

---

## Matriz Endpoint → Handler → Command/Query → DTO → Response

| Endpoint | Handler | Command o Query | Request Mapper | Response Mapper | Authorization | Estado |
|---|---|---|---|---|---|---|
| EP-01 POST /units/{unitId}/attempts | handleStartUnit | StartUnitCommand | toStartUnitRequest | toAttemptSummaryHttp | requireRole(STUDENT) | Hallazgo (H-05, H-08) |
| EP-02 PUT /attempts/{attemptId}/draft | handleAutosaveDraft | AutosaveDraftCommand | toAutosaveDraftRequest | toDraftHttp | requireRole(STUDENT) | OK |
| EP-03 POST /attempts/{attemptId}/versions | handleSubmitVersion | SubmitProductionCommand / SubmitRevisionCommand | toSubmitProductionRequest / toSubmitRevisionRequest | toVersionHttp | requireRole(STUDENT) | Hallazgo (H-03, H-05) |
| EP-04 PATCH /attempts/{attemptId}/phase | handleAdvancePhase | AdvancePhaseCommand | toAdvancePhaseRequest | toAttemptSummaryHttp | requireRole(STUDENT) | OK |
| EP-05 POST /attempts/{attemptId}/reflection | handleCompleteReflection | CompleteReflectionCommand + GetAcademyUnitDetailQuery | toCompleteReflectionRequest | toAttemptSummaryHttp (compuesto) | requireRole(STUDENT) | Hallazgo (composición de 2 llamadas, disclosed) |
| EP-06 POST /units/{unitId}/repetitions | handleRepeatUnit | RepeatUnitCommand | toRepeatUnitRequest | toAttemptSummaryHttp | requireRole(STUDENT) | OK |
| EP-07 POST /units/{unitId}/teacher-overrides | handleApplyTeacherOverride | ApplyTeacherOverrideCommand | toApplyTeacherOverrideRequest | toTeacherOverrideHttp | requireRole(TEACHER) | OK |
| EP-08 POST /students/{studentId}/unit-recommendations | handleAssignUnitToStudent | AssignUnitToStudentCommand | toAssignUnitToStudentRequest | toUnitSummaryHttp | requireRole(TEACHER) | OK |
| EP-09 POST /model-examples | handleCreateModelExample | CreateModelExampleCommand | toCreateModelExampleRequest | toModelExampleHttp | requireRole(TEACHER) | OK |
| EP-10 PATCH /model-examples/{modelExampleId} | handleUpdateModelExample | UpdateModelExampleCommand | toUpdateModelExampleRequest | toModelExampleHttp | requireRole(TEACHER) | OK |
| EP-11 DELETE /model-examples/{modelExampleId} | handleRetireModelExample | RetireModelExampleCommand | toRetireModelExampleRequest | — (204) | requireRole(TEACHER) | OK |
| EP-12 GET /progress-summary | handleGetMyProgressSummary | — (bypass del Query Handler) | — | toStudentProgressSummaryHttp | requireRole(STUDENT) | Hallazgo (H-04, BLOCKER-adyacente) |
| EP-13 GET /units | handleListUnits | ListAcademyUnitsForStudentQuery | toListUnitsForStudentRequest | toUnitSummaryHttp (lista) | requireRole(STUDENT) | OK |
| EP-14 GET /units/{unitId} | handleGetUnitDetail | GetAcademyUnitDetailQuery | toGetUnitDetailRequest | toUnitDetailHttp | **Ninguna (solo autenticación)** | **BLOCKER (H-01)** |
| EP-15 GET /continuation | handleGetContinuation | GetContinuationStateQuery | — | toContinuationHttp / 204 | requireRole(STUDENT) | OK |
| EP-16 GET /units/{unitId}/attempts | handleListUnitAttempts | GetAttemptHistoryQuery | toGetAttemptHistoryRequest | toAttemptSummaryHttp (lista) | resolveAcademyActor (sin requireRole explícito) | Hallazgo (mismo patrón que H-01, menor severidad — requiere verificación adicional) |
| EP-17 GET /attempts/{attemptId}/draft | handleGetDraft | GetDraftQuery | — | toDraftHttp | requireRole(STUDENT) | OK |
| EP-18 GET /attempts/{attemptId}/feedback | handleGetFeedback | GetVersionFeedbackQuery | — | toFeedbackHttp | requireRole(STUDENT) | OK |
| EP-19 GET /model-examples | handleListModelExamples | ListModelExamplesByTextTypeQuery (x1 o x5) | toListModelExamplesRequest | toModelExampleHttp (lista) | requireRole (STUDENT o TEACHER) | Hallazgo (H-11, H-12) |
| EP-20 GET /students/{studentId}/progress-summary | handleGetStudentProgressSummary | GetStudentProgressSummaryHandler (Query real) | — | toStudentProgressSummaryHttp | requireRole(TEACHER) | OK |
| EP-21 PATCH /attempts/{attemptId}/step | handleAdvanceStep | AdvanceStepCommand | toAdvanceStepRequest | toAttemptSummaryHttp | requireRole(STUDENT) | OK |
| EP-22 POST /attempts/{attemptId}/comprehension | handleVerifyComprehension | VerifyComprehensionCommand | toVerifyComprehensionRequest | toAttemptSummaryHttp (200/422 por comparación de `currentStep`) | requireRole(STUDENT) | OK (decisión de status disclosed) |
| EP-23 GET /students/{studentId}/units/{unitId}/history | handleGetStudentUnitHistory | GetStudentUnitHistoryQuery | — | toStudentUnitHistoryHttp | requireRole(TEACHER) | OK |

Nota: se identifican 23 endpoints de negocio (EP-01 a EP-23) en el Contract/OpenAPI real, no 22 (ver H-15). Los 3 endpoints de Health (`/health`, `/health/readiness`, `/health/liveness`) se excluyen de esta matriz por no tener Command/Query/DTO de negocio asociado.

EP-16 se marca como Hallazgo adicional: `handleListUnitAttempts` (unitsHandlers.ts) sigue el mismo patrón que `handleGetUnitDetail` — solo `resolveAcademyActor()`, sin `requireRole()` explícito visible en el extracto revisado — se recomienda verificación puntual idéntica a H-01 antes de cualquier remediación conjunta.

---

## Conclusión

El sistema NO está listo para iniciar Sprint 6.4 (Frontend Integration) en su estado actual. El hallazgo H-01 (BLOCKER) constituye una vulnerabilidad de exposición de datos entre estudiantes explotable con una sola llamada HTTP autenticada como cualquier STUDENT, sin necesidad de ningún otro prerrequisito. Los hallazgos CRITICAL (H-02, H-03, H-04) no bloquean la operación funcional inmediata pero representan desviaciones estructurales del patrón de arquitectura que el propio proyecto declara seguir, con riesgo de acumulación de deuda técnica y de comportamiento divergente entre rutas de código gemelas (EP-03/Server Action, EP-12 vs EP-20).

## Veredicto Final

FAIL
