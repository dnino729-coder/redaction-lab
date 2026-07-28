ACA-002 REPORT — Hallazgos Validation & Remediation Plan v1.0

Metodología aplicada: cada hallazgo del ACA-001 se releyó directamente desde el código fuente (sin asumir que el informe previo era correcto) y, donde fue posible, se contrastó contra el texto literal de `docs/audits/academia-api-contract-v1.3-2026-07-20.md` y `docs/audits/academia-composition-root-bootstrap-v1.0-2026-07-21.md`. Donde no existe un documento Frozen citable, se indica explícitamente en vez de asumir la regla.

---

## H-01 — IDOR en EP-14 (GetAcademyUnitDetail)

**1. Localización.** `features/academy/api/handlers/unitsHandlers.ts::handleGetUnitDetail` (líneas 127-138); `features/academy/application/handlers/GetAcademyUnitDetailHandler.ts::handle()` (líneas 11-19); `features/academy/infrastructure/persistence/read-models/PrismaAcademyReadModelPort.ts::getUnitDetail()` (líneas 75-97).

**2. Evidencia.**
```ts
// unitsHandlers.ts
export async function handleGetUnitDetail(unitId: string, headers: AcademyResponseHeaders) {
  await resolveAcademyActor();
  const container = createAcademyContainer();
  const dto = await container.queryHandlers.getAcademyUnitDetail.handle(
    GetAcademyUnitDetailQuery.fromRequest(toGetUnitDetailRequest(unitId)),
  );
  return jsonSuccess(toUnitDetailHttp(dto), 200, headers);
}
```
```ts
// GetAcademyUnitDetailHandler.ts
const detail = await this.readModelPort.getUnitDetail(request.unitId);
```
```ts
// PrismaAcademyReadModelPort.ts
client.academyUnit.findUnique({ where: { id: unitId }, ... })
```
Contrato (`academia-api-contract-v1.3-2026-07-20.md`, EP-14): "**Autorización:** JWT + rol `STUDENT` + RLS."

**3. Análisis.** `handleGetUnitDetail` solo autentica (`resolveAcademyActor()`); no hay `requireRole()` ni ninguna comprobación de que `unitId` pertenezca al estudiante autenticado. La cadena completa (Handler HTTP → Query Handler → Read Model Port → Prisma) nunca filtra por `studentId`. `getUnitDetail()` ejecuta `findUnique({ where: { id: unitId } })` — sin `studentId` en el `WHERE` — bajo `withActiveClient()`, que además cae a `withServiceContext()` (rol `dashboard_service_role`, RLS bypasseado) porque ningún Query Handler envuelve su llamada en `UnitOfWork.execute()`. Ocurre porque el Contrato exige "rol STUDENT + RLS" pero la implementación no aplica ni lo uno ni lo otro. Consecuencia: cualquier STUDENT autenticado que conozca o adivine un `unitId` (UUID) ajeno obtiene el detalle completo de la unidad de otro estudiante.

**4. Contrato incumplido.** API Contract v1.3, Sección 4, EP-14 ("Autorización: JWT + rol STUDENT + RLS") — violado literalmente: ni el rol ni el RLS se aplican. También Clean Architecture (ausencia de control de acceso al recurso).

**Evidencia adicional relevante para el impacto (mismo defecto, mismos archivos, sin excursión fuera del alcance de H-01):** el mismo patrón — `await resolveAcademyActor()` sin `requireRole()` ni ownership — se repite en `handleListUnitAttempts` (EP-16, línea 146) y en `handleGetFeedback` (EP-18, `attemptsHandlers.ts` línea 199), cuyas contrapartes de Application (`GetAttemptHistoryHandler`, `GetVersionFeedbackHandler`) tampoco verifican propiedad. El Contrato exige igualmente "JWT + rol STUDENT + RLS" para EP-16 y EP-18. Esto no es un hallazgo nuevo — es la misma causa raíz de H-01 (ausencia de guard en Query Handlers de solo lectura), reproducida en 3 de los 23 endpoints, no en 1.

**5. Severidad: BLOCKER (confirmado, y evidencia adicional incrementa la confianza).**

**6. Impacto.**
- Seguridad: crítico — exposición cruzada de datos entre estudiantes (contenido de unidades ajenas en EP-14; historial de intentos ajeno en EP-16; retroalimentación de versiones ajenas en EP-18), sin necesidad de ningún otro prerrequisito que un JWT válido propio.
- Arquitectura: ausencia sistemática de un guard de "ownership" en los Query Handlers de solo lectura que no reciben el `studentId` del actor como filtro.
- Funcionalidad: no afecta el camino feliz (el estudiante legítimo ve sus propios datos correctamente).
- Rendimiento: no aplica.
- Mantenibilidad: el patrón se repite 3 veces de forma idéntica — corregirlo en un solo lugar (guard reusable) resuelve las 3 instancias a la vez.

**7. Corrección mínima.** Capa Application: los Query Handlers `GetAcademyUnitDetailHandler`, `GetAttemptHistoryHandler`, `GetVersionFeedbackHandler` deben recibir el `studentId` del actor como parte del Query y usarlo para filtrar (`Prisma.findFirst({ where: { id, studentId } })`), reutilizando el mismo `AcademyAuthorizationGuard` ya existente para otros Handlers. Alternativamente/adicionalmente, capa API: cada Route Handler debe invocar `requireRole()` y pasar `actor.userId` al Query, consistente con el resto de endpoints STUDENT. La responsabilidad de "ownership" debe moverse desde ningún lugar (hoy) hacia el Query Handler de Application (fuente única de verdad de CQRS), no solo hacia el Route Handler.

---

## H-02 — Service Locator (24 sitios de `createAcademyContainer()`)

**1. Localización.** `features/academy/api/handlers/*.ts` (6 archivos); factory en `features/academy/api/composition/academyContainer.ts::createAcademyContainer()`.

**2. Evidencia.** Conteo verificado con `grep -c "createAcademyContainer()" handlers/*.ts`: `attemptsHandlers.ts:8`, `healthHandlers.ts:1`, `modelExamplesHandlers.ts:4`, `progressHandlers.ts:2`, `teacherHandlers.ts:3`, `unitsHandlers.ts:6` → total 24. Cita textual del propio Composition Root: *"Principio de Composition Root (Mark Seemann): un único lugar donde se conectan todas las implementaciones concretas a sus abstracciones (...) Ningún otro archivo del árbol contiene un `new ConcreteClass()` de una dependencia inyectable; todo se resuelve por el contenedor"* (`academia-composition-root-bootstrap-v1.0-2026-07-21.md`, línea 87).

**3. Análisis.** Cada handler llama `createAcademyContainer()` (una función que retorna un singleton memoizado, `cachedContainer`) dentro de su propio cuerpo, en vez de recibir el contenedor ya compuesto como parámetro desde un punto de composición único (p. ej. `withAcademyRoute`). Por definición (Fowler/Seemann), esto es Service Locator: el consumidor **pide** su dependencia a un localizador global en tiempo de ejecución, en vez de **recibirla** inyectada. Ocurre porque Next.js App Router no tiene un punto de entrada de aplicación único (`main.ts`) donde componer el grafo una vez e inyectarlo — cada función de Route Handler es su propio punto de entrada.

**4. Contrato incumplido.** El texto literal citado arriba habla de `new ConcreteClass()` — los 24 sitios NO instancian con `new`, solo invocan la función factory memoizada, por lo que **no violan la letra exacta** de esa frase. Sí violan el **principio** general de Composition Root que la misma sección enuncia (un único lugar de composición, resuelto por inyección, no por localización). No existe en los documentos revisados una prohibición textual específica de "llamar a la función factory del contenedor desde múltiples archivos" — es una inferencia de principio, no una regla explícita.

**5. Severidad: MAJOR (revisada a la baja desde CRITICAL en ACA-001).** Razón del cambio: (a) el contenedor es un singleton memoizado sin estado mutable por-request — no hay riesgo demostrado de divergencia de comportamiento entre llamadas; (b) es el mismo patrón ya usado por `features/my-plan/infrastructure/composition/myPlanContainer.ts` (convención establecida del proyecto, no una desviación aislada de Academia); (c) no viola la letra exacta de la única regla textual encontrada. Persiste como MAJOR por el impacto real en testabilidad (no se puede inyectar un contenedor de prueba/mock sin monkey-patching del módulo).

**6. Impacto.** Seguridad: ninguno. Arquitectura: acoplamiento a un accessor global en 24 puntos. Funcionalidad: ninguno (memoización evita divergencia). Rendimiento: ninguno (singleton). Mantenibilidad: real — dificulta pruebas unitarias aisladas de cada handler.

**7. Corrección mínima.** Capa API: mover la llamada a `createAcademyContainer()` a `withAcademyRoute()` (el único wrapper compartido por los 23 endpoints) y pasar el contenedor ya resuelto como argumento de `fn(ctx, container)`, eliminando la llamada individual dentro de cada handler.

---

## H-03 — Acceso directo a Domain VO + Repository desde la capa API (EP-03)

**1. Localización.** `features/academy/api/handlers/attemptsHandlers.ts::handleSubmitVersion` (líneas 96-124); duplicado en `features/academy/actions/attemptActions.ts::submitVersionAction` (líneas 89-111).

**2. Evidencia.**
```ts
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
...
const existing = await container.ports.unitOfWork.execute(
  () => container.repositories.attempt.findById(AttemptId.create(attemptId)),
  actor.userId,
);
...
const hasProduction = existing.versions.length > 0;
const versionDto = hasProduction
  ? await container.commandHandlers.submitRevision.handle(...)
  : await container.commandHandlers.submitProduction.handle(...);
```

**3. Análisis.** El Handler HTTP construye un Value Object de Domain (`AttemptId.create`) e invoca un Repository de Domain (`container.repositories.attempt.findById`) directamente, sin pasar por ningún Command/Query Handler de Application. El resultado (`existing.versions.length > 0`) se usa para decidir una regla de negocio: qué Command invocar. Ocurre porque Application (Frozen) no expone un despachador unificado para CMD-02/CMD-05, y la capa API resolvió el vacío leyendo el Aggregate directamente en vez de resolverlo dentro de Application. Consecuencia: (a) violación de dirección de dependencias (Presentation → Domain/Infrastructure sin pasar por Application); (b) lectura redundante — `SubmitProductionHandler`/`SubmitRevisionHandler` ya hacen su propio fetch vía `assertAttemptOwnership`; (c) la misma lógica está duplicada literalmente en `submitVersionAction`, con doble mantenimiento.

**4. Contrato incumplido.** Clean Architecture (regla general de dirección de dependencias, no específica de un documento de Academia, pero consistente con cómo el resto de los 22 endpoints restantes sí delega en Application sin excepción). SOLID (SRP: el Handler HTTP asume una responsabilidad de decisión de negocio). No hay un ADR/ACP que prohíba esto explícitamente por nombre, pero tampoco existe ninguno que lo autorice como excepción (a diferencia de EP-17, donde el propio Contrato sí documenta explícitamente la excepción de "lectura directa vía `AttemptRepository`").

**5. Severidad: CRITICAL (confirmado).**

**6. Impacto.** Seguridad: ninguno directo. Arquitectura: real, capa saltada. Funcionalidad: correcta en el camino feliz, pero frágil — dos lugares deben mantenerse sincronizados. Rendimiento: una consulta extra por request a EP-03 (fetch redundante). Mantenibilidad: alta — cualquier cambio en la regla de despacho CMD-02/CMD-05 debe replicarse en 2 archivos.

**7. Corrección mínima.** Capa Application: introducir un Command Handler despachador único (p. ej. `SubmitVersionHandler`) que internamente decida CMD-02 vs CMD-05 leyendo el Aggregate una sola vez (ya con `assertAttemptOwnership`), y exponerlo como el único punto de entrada para EP-03. Capa API: `handleSubmitVersion` y `submitVersionAction` deben reducirse a invocar ese único Handler, eliminando el `AttemptId`/`repositories.attempt.findById` de ambos archivos.

---

## H-04 — Bypass de CQRS en EP-12 (GetMyProgressSummary)

**1. Localización.** `features/academy/api/handlers/progressHandlers.ts::handleGetMyProgressSummary` (líneas 26-33).

**2. Evidencia.**
```ts
const dto = await container.ports.readModel.getStudentProgressSummary(actor.userId);
```
Contrato (`academia-api-contract-v1.3-2026-07-20.md`, EP-12): "**Dependencias:** `QRY-07 GetStudentProgressSummary`."

**3. Análisis.** El Contrato documenta EP-12 como dependiente de `QRY-07` (es decir, del Query Handler `GetStudentProgressSummaryHandler`), pero la implementación invoca directamente `AcademyReadModelPort.getStudentProgressSummary`, sin pasar por ese Handler. Ocurre porque `GetStudentProgressSummaryHandler` (Application, Frozen) exige incondicionalmente un `teacherId` y `assertTeacherRelationship`, incompatible con el caso de auto-consulta de EP-12 (no hay Profesor involucrado) — es decir, la causa raíz es una incompatibilidad entre el Application Model (Frozen) y el propio API Contract (Frozen), no una negligencia de la capa API. Consecuencia: existen dos rutas de código independientes hacia el mismo dato (EP-12 bypass vs EP-20 vía Handler real), con validaciones potencialmente distintas y riesgo de divergencia futura.

**4. Contrato incumplido.** API Contract v1.3, Sección 4, EP-12 ("Dependencias: QRY-07") — la dependencia declarada no se invoca. La regla más general de CQRS citada en ACA-001 ("todo Query Handler usa EXCLUSIVAMENTE el Read Model") regula el comportamiento *interno* de los Query Handlers, no prohíbe explícitamente que la capa API llame al Read Model Port directamente — en ese sentido específico, ACA-001 sobre-extendió la cita. La violación real y demostrable es la del texto de EP-12, no una regla genérica de CQRS inventada.

**5. Severidad: CRITICAL (confirmado, con matiz).** Se mantiene CRITICAL porque hay una cita textual y directa del Contrato incumplida (no una inferencia), pero se documenta que la causa raíz está en un desacuerdo previo entre Application Model y API Contract, no en una decisión arbitraria de esta capa.

**6. Impacto.** Seguridad: ninguno (el `studentId` usado es siempre `actor.userId`, nunca un valor de cliente). Arquitectura: real — dos caminos de código para el mismo dato. Funcionalidad: correcta hoy, riesgo de divergencia futura si `GetStudentProgressSummaryHandler` cambia su lógica interna (EP-12 no la heredaría). Mantenibilidad: alta.

**7. Corrección mínima.** Capa Application: añadir una variante o sobrecarga de `GetStudentProgressSummaryHandler` (o un segundo Handler, p. ej. `GetMyProgressSummaryHandler`) que no exija `teacherId`, para el caso de auto-consulta, y que internamente siga usando el mismo Read Model Port. Capa API: `handleGetMyProgressSummary` debe invocar ese Handler en vez de tocar `container.ports.readModel` directamente.

---

## H-05 — Idempotency-Key solo valida presencia, no hay deduplicación real

**1. Localización.** `features/academy/api/http/idempotency.ts::requireIdempotencyKey()`.

**2. Evidencia.**
```ts
export function requireIdempotencyKey(request: Request): string {
  const key = request.headers.get("Idempotency-Key");
  if (!key || key.trim().length === 0) { throw new ValidationException(...); }
  return key;
}
```
Contrato (Sección 2, "Nota de idempotencia general"): "El Backend debe devolver la misma respuesta ante una repetición con la misma clave dentro de una ventana de 24 horas, sin duplicar el efecto."

**3. Análisis.** La función solo verifica que el header exista y no esté vacío; no hay almacén de claves procesadas ni ventana de 24h. Ocurre porque construir ese almacén requeriría Infrastructure nueva, fuera del alcance disclosed del Sprint. Consecuencia: un reintento de cliente (timeout, doble clic, retry automático) con la misma clave puede duplicar el efecto de negocio en los 7 endpoints POST-con-efecto (EP-01, EP-03, EP-06, EP-07, EP-08, EP-09, EP-22).

**4. Contrato incumplido.** API Contract v1.3, Sección 2 — cita textual exacta arriba. Incumplimiento confirmado y explícito, no inferido.

**5. Severidad: MAJOR (confirmado).**

**6. Impacto.** Seguridad: bajo. Arquitectura: ninguno. Funcionalidad: real — reintentos legítimos pueden crear recursos duplicados (segundo `Attempt`, segunda `Version`, segunda recomendación docente). Rendimiento: ninguno. Mantenibilidad: el hueco está disclosed en comentario, reduce riesgo de que se olvide.

**7. Corrección mínima.** Capa Infrastructure: nuevo almacén de claves procesadas (tabla o cache con TTL de 24h, análogo a `ProcessedEventIdempotencyStore` ya existente para consumo de Outbox, pero para requests HTTP). Capa API: `requireIdempotencyKey` debe consultar ese almacén antes de invocar el Command y, si la clave ya fue procesada, devolver la respuesta cacheada en vez de re-ejecutar el efecto.

---

## H-06 — Fuga de información en la rama de error 500 genérica

**1. Localización.** `features/academy/api/http/errors.ts::mapErrorToHttp`, rama final (líneas 62-70).

**2. Evidencia.**
```ts
return {
  status: 500,
  body: { code: "ACADEMY_INTERNAL_ERROR", message: "Error técnico interno.", correlationId,
    details: { error: String(error instanceof Error ? error.message : error) } },
};
```

**3. Análisis.** Cualquier excepción no reconocida como `ApplicationException` (errores nativos de Prisma, `SyntaxError` de parseo JSON, cualquier fallo de infraestructura no anticipado) se serializa y se expone en `details.error` directamente al cliente HTTP. Ocurre porque la rama de fallback prioriza dar contexto de depuración sobre ocultar detalles internos. Consecuencia: mensajes de driver de base de datos, nombres de columnas/tablas o rutas internas pueden llegar al cliente.

**4. Contrato incumplido.** API Contract v1.3, Sección 11: el envoltorio de error define `details` como campo opcional pero no especifica qué debe o no debe contener — no hay una prohibición textual explícita de incluir el mensaje de error crudo. Es más una buena práctica de seguridad general (OWASP: no exponer detalles internos en errores 5xx) que una cláusula contractual citable punto por punto.

**5. Severidad: MAJOR (confirmado; no se sostiene BLOCKER porque no hay evidencia de que se filtren credenciales o secretos, solo mensajes de error).**

**6. Impacto.** Seguridad: real — reconocimiento de infraestructura interna para un atacante. Arquitectura: ninguno. Funcionalidad: ninguno. Rendimiento: ninguno. Mantenibilidad: ninguno.

**7. Corrección mínima.** Capa API (`http/errors.ts`): la rama de fallback debe registrar el error completo vía `Logger` (ya disponible) pero devolver al cliente únicamente `code`/`message`/`correlationId`, sin `details.error`, dejando que el `correlationId` sea el mecanismo de correlación para soporte/debugging.

---

## H-07 — `request.json()` sin manejo de error (JSON malformado → 500 en vez de 400)

**1. Localización.** 8 sitios: `attemptsHandlers.ts` (líneas 51, 104, 179, 237), `modelExamplesHandlers.ts` (líneas 32, 55), `teacherHandlers.ts` (línea 36), `unitsHandlers.ts` (línea 98).

**2. Evidencia.**
```ts
const body = (await request.json()) as { content: unknown };
```
Sin try/catch alrededor. Contrato Sección 11: `400` = "Solicitud malformada".

**3. Análisis.** Un body no-JSON o vacío lanza un `SyntaxError` nativo de `JSON.parse`, que no es instancia de `ValidationException` ni de ninguna subclase de `ApplicationException` (confirmado leyendo `errors.ts`), por lo que cae en la rama 500 genérica (H-06) en vez de 400. Ocurre por ausencia de un try/catch dedicado alrededor de `request.json()`. Consecuencia: un cliente que envía un body malformado recibe 500 (con fuga de mensaje, H-06) en vez de 400.

**4. Contrato incumplido.** API Contract v1.3, Sección 11: catálogo de códigos — `400` = "Solicitud malformada (formato de identificador inválido, header requerido ausente)"; aunque el texto no menciona literalmente "JSON malformado", es la categoría de error a la que pertenece por definición ("solicitud malformada").

**5. Severidad: MAJOR (confirmado).**

**6. Impacto.** Seguridad: compone con H-06 (fuga de info). Arquitectura: ninguno. Funcionalidad: código HTTP incorrecto para un caso de entrada inválida común. Rendimiento: ninguno. Mantenibilidad: 8 sitios idénticos, corrección centralizable.

**7. Corrección mínima.** Capa API: envolver el parseo en `withAcademyRoute` o en un helper común (`parseJsonBody(request)`) que capture `SyntaxError` y lance una `ValidationException` (400) explícita, reutilizado por los 8 sitios en vez de duplicar el `try/catch` ocho veces.

---

## H-08 — Orden invertido: autorización antes que validación de formato

**1. Localización.** Patrón repetido en la mayoría de handlers, ejemplo: `unitsHandlers.ts::handleStartUnit` (líneas 33-46).

**2. Evidencia.**
```ts
const actor = await resolveAcademyActor();
requireRole(actor, ["STUDENT"]);          // autorización
const container = createAcademyContainer();
const dto = await container.commandHandlers.startUnit.handle(
  StartUnitCommand.fromRequest(toStartUnitRequest(unitId, actor.userId)), // validación de formato ocurre aquí dentro, en Application
);
```
Contrato, Sección 6: "Todo `unitId`/`attemptId`/`modelExampleId`/`studentId` en la URI debe tener formato UUID v4 válido — de lo contrario, `400 Bad Request` **antes de cualquier verificación de autorización o existencia**."

**3. Análisis.** El texto del Contrato es explícito y literal: la validación de formato debe ocurrir antes que la autorización. La implementación hace lo contrario: `requireRole()` (autorización) se ejecuta antes de que `validateStartUnitRequest` (formato, dentro de `StartUnitCommand.fromRequest`, en Application) tenga oportunidad de correr. Ocurre porque el orden natural del código (Auth → Request Mapper → Application) no separó la validación sintáctica de la de autorización como dos pasos explícitos y ordenados. Consecuencia: un `unitId` con formato inválido pasa primero por la comprobación de rol/autorización antes de ser rechazado por formato — contradice el orden exigido, aunque el código HTTP final (400 vs 403) puede terminar siendo el correcto en la mayoría de los casos porque la validación de formato sí ocurre eventualmente.

**4. Contrato incumplido.** API Contract v1.3, Sección 6 — cita textual exacta y explícita, no inferida. Confirmado con alta confianza.

**5. Severidad: MAJOR (confirmado, con nota de alcance sistémico: el mismo orden se repite en ~20 de los 23 endpoints, no es un caso aislado).**

**6. Impacto.** Seguridad: bajo-moderado (una respuesta 403 antes de 400 puede confirmar a un actor no autorizado que el recurso "existe" en algún sentido, antes de saber si el identificador es siquiera válido — un diferencial de información menor). Arquitectura: real, orden explícitamente definido y no respetado. Funcionalidad: el código HTTP final normalmente es correcto porque la validación de formato ocurre en algún punto, solo que no en el orden documentado. Rendimiento: ninguno. Mantenibilidad: el patrón está repetido en la mayoría de los handlers, requiere una corrección transversal.

**7. Corrección mínima.** Capa API: extraer la validación de formato de identificadores de ruta (UUID v4) a un paso explícito ANTES de `resolveAcademyActor()`/`requireRole()` en cada handler, o centralizarlo en `withAcademyRoute` como un validador de parámetros de ruta que corra primero.

---

## H-09 — Instanciación directa de Infraestructura fuera del Composition Root (Logging)

**1. Localización.** `features/academy/api/http/logging.ts` (línea 7); contraparte legítima en `features/academy/api/composition/academyContainer.ts` (línea 198, `ports.logger`).

**2. Evidencia.**
```ts
// http/logging.ts
const logger = new AcademyConsoleLogger();
```
```ts
// academyContainer.ts
const logger = new AcademyConsoleLogger();
...
const ports = { ..., logger };
```
Cita: *"Ningún otro archivo del árbol contiene un `new ConcreteClass()` de una dependencia inyectable; todo se resuelve por el contenedor"* (`academia-composition-root-bootstrap-v1.0-2026-07-21.md`, línea 87).

**3. Análisis. `http/logging.ts` construye su propia instancia de `AcademyConsoleLogger`, distinta de la ya compuesta en `academyContainer.ts` y usada por más de 12 Handlers de Application internamente. Ocurre porque el logging de request/response HTTP se implementó como un módulo independiente en vez de recibir el logger ya compuesto. Consecuencia: dos instancias del mismo logger conviven en el proceso — si en el futuro `AcademyConsoleLogger` recibiera configuración por constructor (nivel de log, sink, etc.), ambas instancias podrían divergir silenciosamente.

**4. Contrato incumplido.** Esta es, de los 15 hallazgos, la violación **más literal y directa** de la cita textual de Composition Root Bootstrap v1.0 — a diferencia de H-02, aquí sí hay un `new ConcreteClass()` de una dependencia inyectable (`AcademyConsoleLogger`) fuera del único archivo de composición.

**5. Severidad: MAJOR (confirmado).**

**6. Impacto.** Seguridad: ninguno. Arquitectura: real, violación literal del principio citado. Funcionalidad: ninguna diferencia observable hoy (misma clase, mismo comportamiento sin config). Rendimiento: insignificante (una instancia adicional sin estado). Mantenibilidad: riesgo latente de divergencia si el Logger gana configuración.

**7. Corrección mínima.** Capa API: `http/logging.ts` debe recibir el logger como parámetro (del contenedor, vía `withAcademyRoute`) en vez de instanciar `AcademyConsoleLogger` en su propio módulo.

---

## H-10 — Duplicación de lógica entre Route Handlers y Server Actions

**1. Localización.** `features/academy/actions/attemptActions.ts::submitVersionAction` (líneas 89-111) vs `handlers/attemptsHandlers.ts::handleSubmitVersion`; `features/academy/actions/unitActions.ts::startUnitAction` (líneas 15-38) vs `handlers/unitsHandlers.ts::handleStartUnit`.

**2. Evidencia.** `submitVersionAction` reproduce línea por línea la misma construcción `AttemptId.create(attemptId)` + `container.repositories.attempt.findById` + `hasProduction = existing.versions.length > 0` que `handleSubmitVersion` (ver H-03). `startUnitAction` reproduce el mismo `catch (error instanceof ConflictException && error.code === "ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE")` + `getAttemptHistory.handle(...)` + `attempts.find((a) => a.isCurrent)` que `handleStartUnit`.

**3. Análisis.** Dos implementaciones independientes de la misma lógica (dispatch CMD-02/CMD-05 y recuperación de conflicto de EP-01) existen en archivos distintos, sin una función compartida que ambas invoquen. Ocurre porque las Server Actions se escribieron como una capa paralela, no como un envoltorio delgado sobre los mismos Handlers HTTP. Consecuencia: si la regla de negocio cambia (p. ej. el criterio de `hasProduction`), hay que recordar actualizar ambos archivos — un error de sincronización produciría comportamiento distinto entre el flujo REST y el flujo de Server Action para la misma operación.

**4. Contrato incumplido.** No hay un documento Frozen que prohíba textualmente la duplicación entre Route Handlers y Server Actions (es un principio general de mantenibilidad/DRY, no una cláusula arquitectónica nombrada). Es, sin embargo, inconsistente con la propia nota de cabecera de `attemptActions.ts`, que declara explícitamente: *"CERO lógica propia, cero duplicación (reutiliza literalmente los mismos Request/Response Mappers...)"* — la propia intención declarada del archivo se contradice con lo que el código realmente hace en estas dos funciones.

**5. Severidad: MAJOR (confirmado).**

**6. Impacto.** Seguridad: ninguno. Arquitectura: real (mismo hallazgo que H-03, duplicado). Funcionalidad: correcta hoy, frágil a futuro. Rendimiento: ninguno. Mantenibilidad: alta — doble punto de mantenimiento para la misma regla de negocio.

**7. Corrección mínima.** Misma corrección que H-03 (introducir un Handler despachador único en Application para CMD-02/CMD-05 y reutilizar la lógica de recuperación de conflicto de EP-01 como una función compartida) resuelve ambos duplicados a la vez, ya que la causa raíz es común.

---

## H-11 — Fan-out N+1 en EP-19 cuando `textType` se omite

**1. Localización.** `features/academy/api/handlers/modelExamplesHandlers.ts::handleListModelExamples` (líneas 91-121).

**2. Evidencia.**
```ts
const items = textType
  ? await container.queryHandlers.listModelExamplesByTextType.handle(...)
  : (await Promise.all(ALL_TEXT_TYPES.map((type) =>
      container.queryHandlers.listModelExamplesByTextType.handle(...)))).flat();
```
Contrato EP-19: "Parámetros: `textType` (query, opcional)."

**3. Análisis.** Cuando el cliente omite `textType` (caso explícitamente permitido por el Contrato), el handler ejecuta 5 llamadas independientes al Query Handler (una por cada valor del enum `TextType`) en vez de una sola consulta sin filtro. Ocurre porque `ListModelExamplesByTextTypeRequestDto` (Application, Frozen) exige `textType` como valor obligatorio del enum, sin opción de "todos". Consecuencia: 5x el número de round-trips a base de datos en cada request sin filtro, con paginación aplicada después de traer todo el conjunto fusionado (no a nivel de base de datos).

**4. Contrato incumplido.** No hay un documento Frozen que prohíba explícitamente el fan-out — es una limitación de diseño (Application no soporta "sin filtro" como consulta nativa), resuelta de forma funcionalmente correcta pero costosa en la capa API.

**5. Severidad: MINOR (confirmado).**

**6. Impacto.** Seguridad: ninguno. Arquitectura: menor (Presentation importa el enum de Domain, ver H-12). Funcionalidad: correcta. Rendimiento: real pero acotado (5 consultas fijas, no crece con el volumen de datos; el catálogo de `TextType` es fijo en 5 valores). Mantenibilidad: bajo.

**7. Corrección mínima.** Capa Application: añadir un método `listModelExamples(textType?: string)` a `AcademyReadModelPort` que acepte el filtro como opcional a nivel de Read Model (una sola consulta Prisma con `WHERE textType = ? OR true`), eliminando la necesidad del fan-out en la capa API.

---

## H-12 — Importación del enum `TextType` de Domain en la capa API

**1. Localización.** `features/academy/api/handlers/modelExamplesHandlers.ts` (línea 10, 19).

**2. Evidencia.**
```ts
import { TextType } from "@/features/academy/domain/enums/TextType";
const ALL_TEXT_TYPES = Object.values(TextType);
```

**3. Análisis.** Se confirma el hecho: la capa API importa un enum de Domain directamente, en vez de un tipo espejo de Application/DTO. No se encontró, en ninguno de los documentos revisados (API Contract v1.3, Application Layer Spec, Composition Root Bootstrap), una prohibición textual específica de que la Presentation Layer referencie un enum de Domain (a diferencia de Repositories/Aggregates/Value Objects con lógica, que sí están claramente fuera del alcance de Presentation en el resto del código). Un enum de solo datos es un caso límite no cubierto explícitamente por ningún documento Frozen citado.

**4. Contrato incumplido.** Ninguno citable explícitamente. Es una inferencia de principio general de Clean Architecture (dirección de dependencias), no una regla documentada para Academia.

**5. Severidad: OBSERVATION (revisada a la baja desde MINOR — hecho confirmado, pero no hay documento que lo prohíba).**

**6. Impacto.** Arquitectura: menor, cosmético. Resto de dimensiones: sin impacto.

**7. Corrección mínima.** Si se desea eliminar incluso esta dependencia cosmética: capa Application podría exponer `ALL_TEXT_TYPES` como una constante de DTO/Application en vez de que la capa API importe el enum de Domain directamente. No es una corrección urgente.

---

## H-13 — `healthHandlers.ts` importa Infrastructure directamente, sin pasar por el Composition Root

**1. Localización.** `features/academy/api/handlers/healthHandlers.ts` (líneas 4-9); `handleReadiness` no llama a `createAcademyContainer()` en absoluto.

**2. Evidencia.**
```ts
import { runAcademyHealthChecks, checkDatabaseHealth, checkConfigurationHealth } from "@/features/academy/infrastructure/health/academyHealthChecks";
import { loadAcademyInfrastructureConfig } from "@/features/academy/infrastructure/config/academyConfig";
```
El Composition Root Bootstrap v1.0 (Frozen, NestJS) registra explícitamente "4 Health Indicators" como providers Singleton del propio módulo/contenedor (línea 213), no como funciones importadas directamente por el Controller.

**3. Análisis.** En el diseño original (NestJS), los Health Indicators están registrados en el contenedor de DI igual que cualquier otro provider. La reinterpretación a Next.js de `healthHandlers.ts` bypasea ese registro e importa las funciones de Infrastructure directamente. Ocurre porque, a diferencia de otros Handlers, los de salud no dependen de nada que ya esté en `AcademyContainer` (excepto `container.ai.providerFactory`, usado solo en `handleHealth`). Consecuencia: `handleReadiness`/`handleLiveness` no pasan por el Composition Root en absoluto — inconsistente con el resto de la capa API, aunque no incorrecto funcionalmente.

**4. Contrato incumplido.** No hay una cláusula que prohíba esto para Health Checks específicamente; es una desviación del principio general de Composition Root, mitigada por ser un patrón ampliamente aceptado en la industria para endpoints de salud (que deliberadamente no deben depender de que todo el grafo de DI esté sano para poder responder).

**5. Severidad: MINOR (confirmado).**

**6. Impacto.** Arquitectura: menor inconsistencia. Seguridad/Funcionalidad/Rendimiento: ninguno. Mantenibilidad: bajo.

**7. Corrección mínima.** Si se desea consistencia total: exponer `checkDatabaseHealth`/`checkConfigurationHealth` como parte de `AcademyContainer` (p. ej. `container.health.*`) en vez de importarlas directamente. No es urgente dado el bajo impacto.

---

## H-14 — Telemetría sin campo `Handler` distinto

**1. Localización.** `features/academy/api/http/telemetry.ts::AcademyTelemetryEntry`.

**2. Evidencia.**
```ts
export interface AcademyTelemetryEntry {
  readonly endpoint: string; readonly method: string; readonly status: number;
  readonly durationMs: number; readonly at: string;
}
```
API Contract v1.3, Sección 12 (Observabilidad) — texto completo revisado: menciona únicamente Correlation Id, Request Id, Tracing y Logs. **No menciona un campo "Handler" en ningún punto de la Sección 12.**

**3. Análisis.** Se confirma el hecho: no existe un campo `handler` distinto en la telemetría. Sin embargo, la única fuente citada por ACA-001 para este requisito es "Alcance #10 del encargo" — el texto del encargo original de Sprint 6.3 (un documento de trabajo interno), no uno de los documentos Frozen (Functional Specification, API Contract, Domain/Application/Infrastructure Model, ADR, ACP). Se revisó explícitamente la Sección 12 del API Contract v1.3 (el documento más específico sobre observabilidad) y no contiene ese requisito.

**4. Contrato incumplido.** Ninguno de los documentos Frozen citables lo exige explícitamente. Se indica expresamente, conforme a la metodología: "no existe un documento que lo prohíba/exija explícitamente" para este campo específico.

**5. Severidad: OBSERVATION — requiere información adicional (revisada a la baja desde MAJOR/MINOR en ACA-001).** Si existiera un documento adicional no revisado en esta validación (p.ej. una versión posterior del Infrastructure Model) que sí exija el campo, la severidad debería reconsiderarse.

**6. Impacto.** Mínimo hoy: `endpoint` ya permite distinguir la función servidora en la práctica (relación 1:1 entre endpoint y handler en el código actual).

**7. Corrección mínima.** Si se decide adoptar el campo de todas formas (por utilidad operativa, no por incumplimiento contractual demostrado): añadir `handler: string` a `AcademyTelemetryEntry` y pasarlo como argumento adicional de `withAcademyRoute`.

---

## H-15 — Discrepancia "22 endpoints" (encargo) vs. 23 endpoints reales

**1. Localización.** `docs/audits/academia-api-contract-v1.3-2026-07-20.md`, Sección 4 (enumera EP-01 a EP-23 explícitamente); `features/academy/api/openapi/academy.openapi.json` (22 *paths* únicos, 23 operaciones de negocio + 3 de Health).

**2. Evidencia.** El propio índice del Contrato v1.3 lista secciones `### EP-01` … `### EP-23` sin saltos. El `openapi.json` fue verificado programáticamente: `len(paths) == 22` (algunas rutas comparten un mismo path con 2 métodos: `/units/{unitId}/attempts`, `/model-examples`, `/attempts/{attemptId}/draft`), pero el número de operaciones de negocio reales es 23.

**3. Análisis. El Contrato v1.3 (documento Frozen, fuente de verdad) define inequívocamente 23 endpoints de negocio, no 22. El encargo original de ACA-001 pedía una matriz de "22 endpoints" — esto es un error de conteo del propio texto de encargo, no un defecto de la implementación de Sprint 6.3, que efectivamente implementa los 23 endpoints reales del Contrato (confirmado por la matriz de ACA-001, que terminó listando EP-01 a EP-23).

**4. Contrato incumplido.** Ninguno — la implementación es fiel al Contrato real (23 endpoints). El "incumplimiento" real, si lo hay, está en el texto del encargo de auditoría, no en el código.

**5. Severidad: OBSERVATION (revisada a la baja desde MINOR — no es un defecto del Sprint 6.3).**

**6. Impacto.** Ninguno sobre el sistema. Podría causar confusión documental si se usa "22" como número de referencia en futuros documentos.

**7. Corrección mínima.** No aplica corrección de código. Se recomienda, únicamente a nivel documental, que futuros encargos de auditoría citen "23 endpoints (EP-01–EP-23)" para evitar reabrir esta discrepancia.

---

## Matriz de Estado

| Hallazgo | Estado |
|---|---|
| H-01 | Confirmado |
| H-02 | Confirmado parcialmente (severidad revisada CRITICAL → MAJOR) |
| H-03 | Confirmado |
| H-04 | Confirmado parcialmente (severidad CRITICAL se mantiene, causa raíz matizada) |
| H-05 | Confirmado |
| H-06 | Confirmado |
| H-07 | Confirmado |
| H-08 | Confirmado |
| H-09 | Confirmado |
| H-10 | Confirmado |
| H-11 | Confirmado |
| H-12 | Confirmado parcialmente (hecho real, sin regla documentada — severidad MINOR → OBSERVATION) |
| H-13 | Confirmado |
| H-14 | Requiere información adicional (sin documento Frozen citable — severidad → OBSERVATION) |
| H-15 | Confirmado parcialmente (hecho real, pero no es defecto de Sprint 6.3 — severidad → OBSERVATION) |

Ningún hallazgo resultó ser Falso Positivo.

---

## Matriz de Priorización

| Prioridad | Hallazgos |
|---|---|
| Sprint inmediato | H-01 (BLOCKER — IDOR en EP-14/16/18), H-03 (acceso directo a Domain/Repository en EP-03), H-04 (bypass de CQRS en EP-12) |
| Sprint siguiente | H-05 (Idempotency-Key sin dedup real), H-06 (fuga de info en error 500), H-07 (JSON malformado → 500), H-08 (orden auth/validación), H-09 (logger duplicado), H-10 (duplicación Route Handler/Server Action) |
| Backlog técnico | H-02 (Service Locator — cambio arquitectónico amplio, sin bug activo), H-11 (fan-out N+1 EP-19), H-13 (health checks fuera del contenedor) |
| Sin acción | H-12 (import de enum Domain, sin regla documentada), H-14 (campo Handler en telemetría, sin fuente Frozen), H-15 (discrepancia de conteo, error del encargo, no del código) |

---

## Architecture Compliance Score (recalculado desde cero)

Metodología: se evaluó cada una de las 8 dimensiones del ACA-001 de forma independiente (0-100), basado únicamente en los hallazgos confirmados que le aplican, y se promedió sin ponderación adicional.

| Dimensión | Score | Justificación |
|---|---|---|
| Clean Architecture | 55 | H-02 (MAJOR, revisado), H-03 (CRITICAL), H-09 (MAJOR), H-13 (MINOR) — desviaciones reales pero acotadas a puntos concretos, no generalizadas a los 23 endpoints. |
| DDD | 65 | Solo H-03 involucra acceso directo a un Value Object/Repository de Domain desde Presentation, limitado a 2 archivos (handler + Server Action de EP-03). |
| CQRS | 55 | H-04 (bypass confirmado con cita textual de Contrato), causa raíz compartida con una incompatibilidad Application-vs-Contract preexistente. |
| SOLID | 60 | H-03 (SRP) y H-10 (DRY) confirmados; el resto de handlers respeta responsabilidad única de orquestación. |
| API Contract | 35 | La dimensión más afectada: H-01 (BLOCKER, viola literalmente "rol STUDENT + RLS" en 3 endpoints), H-04 (viola literalmente "Dependencias: QRY-07"), H-05 y H-08 (violaciones textuales confirmadas de Secciones 2 y 6). |
| OpenAPI | 90 | Sin contradicciones estructurales encontradas; H-15 se descarta como defecto real (es un error del encargo, no del artefacto). |
| Security | 20 | H-01 (BLOCKER, IDOR confirmado en 3 endpoints con datos reales de otros estudiantes), H-06 y H-07 (fuga de información compuesta). Es la dimensión más crítica del sistema. |
| Performance | 80 | Solo H-11 (fan-out acotado a 5 llamadas fijas) y la lectura redundante de H-03; sin problemas de escalabilidad demostrados. |

**Cálculo:** (55 + 65 + 55 + 60 + 35 + 90 + 20 + 80) / 8 = 460 / 8 = **57.5 ≈ 58/100**.

Architecture Compliance Score: **58/100**

(No se reutiliza el 38/100 del ACA-001: la revisión evidencia que varias severidades estaban sobre-extendidas — H-02 y H-12 en particular — mientras que H-01 se confirma con evidencia contractual aún más directa de la que citó el informe original.)

---

## Veredicto Final

FAIL

Justificación: persiste un hallazgo BLOCKER confirmado con evidencia de código y de contrato (H-01 — IDOR verificado en EP-14, con el mismo patrón reproducido en EP-16 y EP-18), junto con dos hallazgos CRITICAL confirmados (H-03, H-04). La presencia de un BLOCKER activo, no mitigado, con exposición real de datos entre estudiantes, es por definición incompatible con cualquiera de los veredictos "PASS" — incluyendo "PASS WITH MAJOR FINDINGS", reservado para escenarios sin BLOCKER ni CRITICAL sin resolver.
