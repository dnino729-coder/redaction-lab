ACA-003 REPORT — Evidence Validation Report (BLOCKER H-01)

---

## Paso 1 — Identificación exacta de EP-14, EP-16, EP-18

| | Endpoint | Método | Route Handler (archivo) | Handler HTTP invocado | Command/Query |
|---|---|---|---|---|---|
| EP-14 | `/api/v1/academy/units/{unitId}` | `GET` | `app/api/v1/academy/units/[unitId]/route.ts` | `handleGetUnitDetail` (`features/academy/api/handlers/unitsHandlers.ts`) | `GetAcademyUnitDetailQuery` → `GetAcademyUnitDetailHandler` (QRY-02) |
| EP-16 | `/api/v1/academy/units/{unitId}/attempts` | `GET` | `app/api/v1/academy/units/[unitId]/attempts/route.ts` | `handleListUnitAttempts` (`features/academy/api/handlers/unitsHandlers.ts`) | `GetAttemptHistoryQuery` → `GetAttemptHistoryHandler` (QRY-04) |
| EP-18 | `/api/v1/academy/attempts/{attemptId}/feedback` | `GET` | `app/api/v1/academy/attempts/[attemptId]/feedback/route.ts` | `handleGetFeedback` (`features/academy/api/handlers/attemptsHandlers.ts`) | `GetVersionFeedbackQuery` → `GetVersionFeedbackHandler` (QRY-05) |

Evidencia literal de los 3 archivos `route.ts`:
```ts
// app/api/v1/academy/units/[unitId]/route.ts
export async function GET(request: NextRequest, { params }: { params: { unitId: string } }) {
  return withAcademyRoute(request, "EP-14 GetAcademyUnitDetail", (ctx) =>
    handleGetUnitDetail(params.unitId, ctx),
  );
}
```
```ts
// app/api/v1/academy/units/[unitId]/attempts/route.ts
export async function GET(request: NextRequest, { params }: { params: { unitId: string } }) {
  return withAcademyRoute(request, "EP-16 GetAttemptHistory", (ctx) =>
    handleListUnitAttempts(request, params.unitId, ctx),
  );
}
```
```ts
// app/api/v1/academy/attempts/[attemptId]/feedback/route.ts
export async function GET(request: NextRequest, { params }: { params: { attemptId: string } }) {
  return withAcademyRoute(request, "EP-18 GetVersionFeedback", (ctx) =>
    handleGetFeedback(request, params.attemptId, ctx),
  );
}
```

También confirmado: `middleware/auth.ts` (línea 54) solo declara público `"/api/v1/academy/health(.*)"`. Los 3 endpoints anteriores **no** están en la lista de rutas públicas — el middleware de Clerk exige sesión válida antes de que `withAcademyRoute` se ejecute. Esto se documenta porque es relevante para el Paso 6: la autenticación (sesión Clerk válida) sí está garantizada; lo que se investiga es la autorización posterior.

---

## Paso 2 — Citas literales del API Contract v1.3 y del Application Model v1.4

**API Contract v1.3** (`docs/audits/academia-api-contract-v1.3-2026-07-20.md`):

> EP-14: "**Autorización:** JWT + rol `STUDENT` + RLS."

> EP-16: "**Autorización:** JWT + rol `STUDENT` + RLS."

> EP-18: "**Autorización:** JWT + rol `STUDENT` + RLS."

> Sección 6 (Validaciones): "Todo `unitId`/`attemptId`/`modelExampleId`/`studentId` en la URI debe tener formato UUID v4 válido — de lo contrario, `400 Bad Request` antes de cualquier verificación de autorización o existencia."

> Sección 11 (Errores), catálogo: "`404` | Recurso inexistente o fuera del alcance del actor (nunca se distingue de 'no autorizado' cuando la distinción revelaría información sensible...)."

**Application Model v1.4** (`docs/audits/academia-application-model-v1.4-2026-07-20.md`):

> Sección 13 (Seguridad), línea 520-521: "**Autorización:** verificada en el límite de cada caso de uso (Sección 3), antes de cargar cualquier Aggregate: — Estudiante: solo puede invocar Commands/Queries sobre sus propias `AcademyUnit`/`Attempt` (ownership por `StudentId`)."

> Sección 5 (Queries), QRY-02 (línea 289-294): "Objetivo: obtener el detalle de una `AcademyUnit` específica. — Filtros: `unitId`." (no incluye `studentId` como filtro).

> Sección 5, QRY-04 (línea 303-308): "Objetivo: listar todos los Intentos (...) de una `AcademyUnit`. — Filtros: `unitId`." (no incluye `studentId`).

> Sección 5, QRY-05 (línea 310-315): "Objetivo: obtener el contenido de una `Version` y su `Feedback` asociada. — Filtros: `attemptId`, `versionNumber`." (no incluye `studentId`).

No se encontró, en ninguno de los dos documentos, una cláusula que exima explícitamente a QRY-02/QRY-04/QRY-05 de la regla general de ownership de la Sección 13. La regla de la Sección 13 se declara de forma general ("Commands/Queries"), sin excepción nombrada para estas tres.

---

## Paso 3 — Árbol de ejecución completo

### EP-14 — GET /units/{unitId}
```
HTTP Request (GET /api/v1/academy/units/{unitId})
  ↓
Route Handler: app/api/v1/academy/units/[unitId]/route.ts::GET → withAcademyRoute(...)
  ↓
Authentication: features/academy/api/http/auth.ts::resolveAcademyActor()
  → auth() de @clerk/nextjs/server (líneas 22-28: exige clerkUserId, si no hay sesión lanza UnauthorizedException)
  → findStudentIdByClerkId(clerkUserId) (línea 30) — resuelve el userId interno
  ↓
Authorization: **NINGUNA** — unitsHandlers.ts::handleGetUnitDetail (líneas 127-138) NO llama a requireRole() ni a ningún método de AcademyAuthorizationGuard.
  ↓
Application Handler: GetAcademyUnitDetailHandler.handle() (líneas 11-19)
  → validateGetAcademyUnitDetailRequest(request) — valida formato, NO ownership
  → this.readModelPort.getUnitDetail(request.unitId) — **sin studentId**
  ↓
Repository/Read Model: PrismaAcademyReadModelPort.getUnitDetail() (líneas 75-97)
  → client.academyUnit.findUnique({ where: { id: unitId } }) — **sin studentId en el WHERE**
  → ejecutado vía withActiveClient() → cae a withServiceContext() (RLS bypasseado) porque ningún Query Handler envuelve la llamada en UnitOfWork.execute()
  ↓
Response: 200 OK con AcademyUnitDetailDTO completo del unitId solicitado, sin importar a quién pertenezca.
```

### EP-16 — GET /units/{unitId}/attempts
```
HTTP Request (GET /api/v1/academy/units/{unitId}/attempts)
  ↓
Route Handler: app/api/v1/academy/units/[unitId]/attempts/route.ts::GET → withAcademyRoute(...)
  ↓
Authentication: resolveAcademyActor() (idéntico a EP-14)
  ↓
Authorization: **NINGUNA** — unitsHandlers.ts::handleListUnitAttempts (líneas 141-156): `await resolveAcademyActor();` sin asignar el resultado a una variable usada después, y sin requireRole().
  ↓
Application Handler: GetAttemptHistoryHandler.handle() (líneas 10-14)
  → validateGetAttemptHistoryRequest(request) — formato, NO ownership
  → this.readModelPort.listAttemptsByUnit(request.unitId) — **sin studentId**
  ↓
Repository/Read Model: PrismaAcademyReadModelPort.listAttemptsByUnit() (líneas 131-143)
  → client.attempt.findMany({ where: { academyUnitId: unitId }, ... }) — **sin studentId en el WHERE**
  ↓
Response: 200 OK con la lista paginada de AttemptSummaryDTO del unitId solicitado, sin importar a quién pertenezca.
```

### EP-18 — GET /attempts/{attemptId}/feedback
```
HTTP Request (GET /api/v1/academy/attempts/{attemptId}/feedback)
  ↓
Route Handler: app/api/v1/academy/attempts/[attemptId]/feedback/route.ts::GET → withAcademyRoute(...)
  ↓
Authentication: resolveAcademyActor() (idéntico a EP-14)
  ↓
Authorization: **NINGUNA** — attemptsHandlers.ts::handleGetFeedback (líneas 194-208): `await resolveAcademyActor();` sin requireRole() ni verificación de propiedad del attemptId.
  ↓
Application Handler: GetVersionFeedbackHandler.handle() (líneas 8-27)
  → validateGetVersionFeedbackRequest(request) — formato, NO ownership
  → this.readModelPort.getVersionFeedback(request.attemptId, request.versionNumber) — **sin studentId**
  ↓
Repository/Read Model: PrismaAcademyReadModelPort.getVersionFeedback() (líneas 145-160)
  → client.version.findUnique({ where: { attemptId_versionNumber: {...} }, ... }) — **sin studentId en el WHERE, ni join que lo verifique**
  ↓
Response: 200 OK con VersionDTO + FeedbackDTO del attemptId solicitado, sin importar a quién pertenezca.
```

En los tres árboles, el paso "Authorization" está vacío — no existe ningún nodo entre Authentication y Application Handler que verifique rol ni ownership.

---

## Paso 4 — Evidencia de ownership

Se buscó explícitamente cada uno de los patrones solicitados en los archivos del árbol de ejecución de EP-14/16/18:

| Patrón buscado | ¿Existe en el flujo de EP-14/16/18? | Evidencia |
|---|---|---|
| `studentId == authenticatedUserId` | No | No aparece en `handleGetUnitDetail`, `handleListUnitAttempts`, `handleGetFeedback`, ni en `GetAcademyUnitDetailHandler`, `GetAttemptHistoryHandler`, `GetVersionFeedbackHandler`. |
| `ownerId == authenticatedUserId` | No | Ídem. |
| `repository.findByStudent(userId)` | No | Los tres Query Handlers llaman a `readModelPort.getUnitDetail(unitId)`, `listAttemptsByUnit(unitId)`, `getVersionFeedback(attemptId, versionNumber)` — ninguno recibe `studentId`/`userId` como argumento. |
| `WHERE student_id = currentUser` | No | Confirmado leyendo `PrismaAcademyReadModelPort.ts` líneas 75-97 (`getUnitDetail`), 131-143 (`listAttemptsByUnit`), 145-160 (`getVersionFeedback`): ninguno de los tres `WHERE`/`findUnique` incluye `studentId`. |
| `Policy.canAccess()` | No | No se importa ninguna clase `*Policy` en `unitsHandlers.ts` ni `attemptsHandlers.ts` ni en los 3 Handlers de Application citados. |
| `Specification.isOwner()` | No | Las únicas Specifications usadas en `PrismaAcademyReadModelPort.ts` son `EligibleForUnlockSpecification`/`RepeatableSpecification` (líneas 18-19, 35-36) — evalúan elegibilidad de desbloqueo/repetición, no ownership. |
| `RLS` | No, para estas 3 lecturas | `PrismaAcademyReadModelPort` usa `withActiveClient()` (import línea 21). Se confirmó en `PrismaClientContext.ts` que `withActiveClient()` solo aplica el cliente RLS-scoped (`withStudentContext`) si existe una transacción activa en `AsyncLocalStorage` (`transactionStorage.getStore()`); si no la hay, cae a `withServiceContext()` (RLS bypasseado). Ninguno de los 3 Query Handlers invoca `UnitOfWork.execute()` antes de leer — por lo tanto no hay transacción activa, y las 3 lecturas se ejecutan bajo `withServiceContext()`. |
| Tenant Filter | No | No existe un mecanismo de tenant en Academia (no aplica al dominio del producto); no se buscó más allá de confirmar su ausencia como concepto. |
| Ownership Filter (genérico) | No, en estas 3 rutas | Existe como mecanismo — `AcademyAuthorizationGuard.assertUnitOwnership(unitId, studentId)` y `assertAttemptOwnership(attemptId, studentId)` (`features/academy/application/services/AcademyAuthorizationGuard.ts`, líneas 21-31 y 33-43) — pero **no se invoca en ningún punto de los árboles de EP-14/16/18**. Se confirmó que sí se invoca en otros 8 Handlers del mismo Composition Root (`StartUnitHandler`, `RepeatUnitHandler`, `SubmitProductionHandler`, `AutosaveDraftHandler`, `AdvanceStepHandler`, `VerifyComprehensionHandler`, `AdvanceToReflectionHandler`, `CompleteReflectionHandler`), demostrando que el mecanismo existe, funciona y es el patrón establecido del proyecto — simplemente no fue conectado a estos 3 Query Handlers de solo lectura.

**Conclusión del Paso 4:** no existe ninguna comprobación de ownership, en ninguna capa, para EP-14, EP-16 ni EP-18. Esto se demuestra por ausencia verificada de código (no por ausencia de búsqueda): se leyeron íntegros los 3 Route Handlers, los 3 Application Handlers y los 3 métodos correspondientes de `PrismaAcademyReadModelPort`, y ninguno contiene el patrón buscado.

---

## Paso 5 — Búsqueda de bypass

| Endpoint | ¿Modificar el identificador en la URL permite acceder a un recurso ajeno? | Veredicto | Justificación (evidencia) |
|---|---|---|---|
| `GET /units/{unitId}` (EP-14) | Sí | **POSIBLE** | `handleGetUnitDetail` no valida ownership; `GetAcademyUnitDetailHandler` no valida ownership; `getUnitDetail()` no filtra por `studentId`. Cualquier `unitId` con formato UUID v4 válido que exista en la tabla `academyUnit`, sin importar el `studentId` real, produce `200 OK` con el DTO completo. |
| `GET /units/{unitId}/attempts` (EP-16) | Sí | **POSIBLE** | `handleListUnitAttempts` no valida ownership; `GetAttemptHistoryHandler` no valida ownership; `listAttemptsByUnit()` filtra únicamente por `academyUnitId`, no por `studentId`. Cualquier `unitId` ajeno con `Attempt`s asociados devuelve su historial completo. |
| `GET /attempts/{attemptId}/feedback` (EP-18) | Sí | **POSIBLE** | `handleGetFeedback` no valida ownership; `GetVersionFeedbackHandler` no valida ownership; `getVersionFeedback()` filtra por `attemptId_versionNumber`, no por `studentId`. Cualquier `attemptId` ajeno con una `Version`/`Feedback` asociada es legible. |

No se evaluaron `/students/{studentId}` ni `/history/{historyId}` porque no forman parte del alcance de H-01 (EP-14/16/18); no se investigan aquí, conforme a la restricción de no buscar nuevos hallazgos.

En los tres casos, "POSIBLE" se basa en la ausencia demostrada de cualquier control (Paso 4) — no se ejecutó la solicitud HTTP real contra una base de datos en ejecución (no hay entorno de runtime disponible en esta sesión de auditoría), por lo que la demostración es de código estático, no de explotación en vivo. Esto se declara explícitamente para no sobre-afirmar.

---

## Paso 6 — Clasificación del tipo de autorización implementada

**Clasificación: Autenticación + Rol (parcialmente, e inconsistente) — en EP-14, EP-16 y EP-18 específicamente: Solo Autenticación.**

Justificación: el patrón general del resto de la capa API (20 de 23 endpoints, confirmado en handlers previamente auditados) es "Autenticación + Rol" (`resolveAcademyActor()` + `requireRole()`), y en los endpoints de escritura sobre recursos propios, adicionalmente "Autenticación + Rol + Ownership" vía `AcademyAuthorizationGuard`. Sin embargo, para los tres endpoints bajo examen específicamente:
- EP-14 (`handleGetUnitDetail`): solo `await resolveAcademyActor();` — sin `requireRole()`, sin ownership. → **Solo Autenticación.**
- EP-16 (`handleListUnitAttempts`): solo `await resolveAcademyActor();` — sin `requireRole()`, sin ownership. → **Solo Autenticación.**
- EP-18 (`handleGetFeedback`): solo `await resolveAcademyActor();` — sin `requireRole()`, sin ownership. → **Solo Autenticación.**

Ninguno de los tres alcanza siquiera el nivel "Autenticación + Rol" (no hay `requireRole()`), y ninguno tiene RLS efectivo (Paso 4). No corresponde ninguna de las categorías superiores ("+ Ownership", "+ RLS", "+ Ownership + RLS") para estos 3 endpoints puntuales.

---

## Paso 7 — Cumplimiento del contrato

| Requisito (cita literal) | Endpoint | Estado |
|---|---|---|
| API Contract v1.3, EP-14: "Autorización: JWT + rol STUDENT + RLS" | EP-14 | **No cumple** — falta rol y RLS (Pasos 3-4). |
| API Contract v1.3, EP-16: "Autorización: JWT + rol STUDENT + RLS" | EP-16 | **No cumple** — falta rol y RLS. |
| API Contract v1.3, EP-18: "Autorización: JWT + rol STUDENT + RLS" | EP-18 | **No cumple** — falta rol y RLS. |
| Application Model v1.4, Sección 13: "Estudiante: solo puede invocar Commands/Queries sobre sus propias AcademyUnit/Attempt (ownership por StudentId)" | EP-14, EP-16, EP-18 | **No cumple** — ninguno de los tres verifica ownership por StudentId, confirmado en Paso 4. |
| API Contract v1.3, Sección 6: "UUID v4 válido... 400 antes de cualquier verificación de autorización" | EP-14, EP-16, EP-18 | **No aplica a este hallazgo** — este requisito es sobre orden de validación (H-08 en ACA-002), no sobre ownership; no se evalúa aquí para no salir del alcance de H-01. |
| API Contract v1.3, Sección 11: "404 ... nunca se distingue de 'no autorizado'..." | EP-14, EP-16, EP-18 | **No demostrable si aplica como mitigación** — el código no distingue 404 de 403 en estos casos porque simplemente no hay ninguna verificación que produzca ni 403 ni un 404-por-no-autorizado: si el recurso existe (con cualquier `studentId`), se devuelve 200 con los datos. Este principio de "no distinguir" está pensado para *cuando sí existe* una verificación de autorización — aquí no hay ninguna que ocultar detrás de un 404, por lo que la cláusula no mitiga nada en este caso. |

---

## Paso 8 — Clasificación del riesgo OWASP

**Categoría: API1:2023 — Broken Object Level Authorization (BOLA/IDOR), según OWASP API Security Top 10 (2023).**

Justificación: el patrón demostrado en los Pasos 3-5 coincide exactamente con la definición de BOLA/IDOR — un actor autenticado y con identidad válida (`resolveAcademyActor()` resuelve correctamente su propio `userId`) puede acceder a un objeto (`AcademyUnit`, `Attempt`, `Version`/`Feedback`) identificado por un valor de la URL (`unitId`/`attemptId`) que pertenece a otro sujeto, porque el servidor nunca verifica que el objeto solicitado pertenezca al sujeto autenticado antes de devolverlo. No corresponde a API2 (Broken Authentication) porque la autenticación en sí (sesión Clerk, resolución de `userId`) funciona correctamente y no se demostró ninguna falla en ella. No corresponde a API5 (Broken Function Level Authorization) porque el rol no es lo que falla exclusivamente (de hecho ni siquiera se verifica el rol) — lo que falla es la verificación a nivel de **objeto/instancia**, no de función/endpoint en abstracto.

---

## Paso 9 — Impacto

| Dimensión | Nivel | Justificación |
|---|---|---|
| Confidencialidad | **Alto** | Exposición demostrada (a nivel de código) de contenido académico de un estudiante (detalle de unidad, historial de intentos, retroalimentación de versiones) a otro estudiante autenticado sin relación alguna con ese recurso. No se calificó "Crítico" porque no se demostró exposición de credenciales, datos de pago, o PII de contacto (email/teléfono) en los DTO involucrados — el contenido expuesto es académico (progreso, texto de intentos, feedback), sensible pero no de la categoría más alta. |
| Integridad | **Ninguno** | Los tres endpoints son de solo lectura (`GET`); no se demostró ninguna vía de escritura/modificación derivada de este hallazgo específico. |
| Disponibilidad | **Ninguno** | No se demostró ningún vector de denegación de servicio derivado de este hallazgo. |

---

## Paso 10 — Veredicto técnico

**A) H-01 CONFIRMADO — Existe un IDOR demostrable.**

Evidencia consolidada que sustenta este veredicto:
- Archivo/función/método por endpoint: ver Pasos 1 y 3 (rutas exactas, handlers exactos, líneas exactas).
- Ausencia de ownership demostrada por lectura íntegra de los 3 Route Handlers, 3 Application Handlers y 3 métodos de `PrismaAcademyReadModelPort` (Paso 4) — no por inferencia.
- Mecanismo de ownership (`AcademyAuthorizationGuard.assertUnitOwnership`/`assertAttemptOwnership`) confirmado existente y usado en 8 Handlers distintos del mismo proyecto, confirmando que su ausencia en estos 3 no es una limitación técnica sino una omisión puntual.
- Documento incumplido, cita literal y directa: API Contract v1.3, Sección 4 ("Autorización: JWT + rol STUDENT + RLS", EP-14/16/18) y Application Model v1.4, Sección 13 ("Estudiante: solo puede invocar Commands/Queries sobre sus propias AcademyUnit/Attempt (ownership por StudentId)").
- RLS confirmado inefectivo para estas 3 lecturas por el mecanismo de fallback de `withActiveClient()` a `withServiceContext()` en ausencia de una transacción activa (`PrismaClientContext.ts`), y ninguno de los 3 Query Handlers abre una transacción.

El alcance real confirmado es **3 de 23 endpoints** (EP-14, EP-16, EP-18) — no se investigó ni se afirma nada sobre el resto de endpoints, conforme a la restricción de esta auditoría.
