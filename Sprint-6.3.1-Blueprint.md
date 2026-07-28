Sprint 6.3.1 — Implementation Blueprint v1.0
Remediation Blueprint — H-01 (OWASP API1:2023 BOLA)

---

## Tarea 1 — Inventario de cambios

| Archivo | Tipo de cambio | Obligatorio | Riesgo |
|---|---|---|---|
| `features/academy/application/ports/AcademyReadModelPort.ts` | Actualizar firma (interfaz) | Sí | Medio — rompe la única implementación y los 3 Query Handlers hasta que se propague |
| `features/academy/infrastructure/persistence/read-models/PrismaAcademyReadModelPort.ts` | Actualizar ReadModel | Sí | Medio — 2 de los 3 métodos requieren filtro por relación (`academyUnit: { studentId }`); `getVersionFeedback` cambia de `findUnique` a `findFirst` |
| `features/academy/application/dto/QueryDto.ts` | Actualizar DTO | Sí | Bajo — solo añade un campo `readonly studentId: string` a 3 interfaces ya existentes |
| `features/academy/application/validators/queryValidators.ts` | Actualizar Validator | Sí | Bajo — añade `requireUuid(request.studentId, "studentId")` a 3 funciones ya existentes |
| `features/academy/application/handlers/GetAcademyUnitDetailHandler.ts` | Actualizar Handler | Sí | Bajo — una línea (propagar `request.studentId`) |
| `features/academy/application/handlers/GetAttemptHistoryHandler.ts` | Actualizar Handler | Sí | Bajo — una línea |
| `features/academy/application/handlers/GetVersionFeedbackHandler.ts` | Actualizar Handler | Sí | Bajo — una línea |
| `features/academy/api/request-mappers/unitRequestMappers.ts` | Actualizar Mapper | Sí | Bajo — `toGetUnitDetailRequest`, `toGetAttemptHistoryRequest` ganan parámetro `studentId` |
| `features/academy/api/request-mappers/attemptRequestMappers.ts` | Actualizar Mapper | Sí | Bajo — `toGetVersionFeedbackRequest` gana parámetro `studentId` |
| `features/academy/api/handlers/unitsHandlers.ts` | Actualizar Handler | Sí | Medio — 3 funciones afectadas: `handleGetUnitDetail` (añade `requireRole`), `handleListUnitAttempts` (añade `requireRole`), y el call site interno de `handleStartUnit` (EP-01) que invoca `toGetAttemptHistoryRequest` |
| `features/academy/api/handlers/attemptsHandlers.ts` | Actualizar Handler | Sí | Medio — 2 funciones afectadas: `handleGetFeedback` (añade `requireRole`), y el call site interno de `handleSubmitVersion` (EP-03) que invoca `toGetVersionFeedbackRequest` |
| `features/academy/actions/unitActions.ts` | Actualizar Handler | Sí | Bajo — `startUnitAction` invoca `toGetAttemptHistoryRequest`, ya tiene `actor.userId` en scope |
| Archivos de test (nuevos, no existen hoy) | Crear Tests | Sí | Bajo — no hay tests previos que romper; se confirmó por búsqueda (`*.test.ts`/`*.spec.ts`) que `features/academy` no tiene ningún archivo de prueba actualmente |

**No incluidos (confirmado explícitamente que NO cambian, por instrucción del ACP-002):** `features/academy/api/composition/academyContainer.ts` (Composition Root — los 3 Query Handlers no ganan dependencias de constructor), cualquier archivo de `features/academy/domain/`, `prisma/schema.prisma`, migraciones, `features/academy/application/services/AcademyAuthorizationGuard.ts` (no se usa en esta solución), `features/academy/actions/attemptActions.ts` (confirmado: no invoca `getVersionFeedback` en ninguna de sus 4 funciones).

---

## Tarea 2 — Orden exacto de implementación

```
Paso 1
Modificar interfaz AcademyReadModelPort (getUnitDetail, listAttemptsByUnit, getVersionFeedback → +studentId)
↓
Paso 2
Actualizar implementación Prisma (PrismaAcademyReadModelPort — 3 métodos)
↓
Paso 3
Actualizar DTO (QueryDto.ts — 3 interfaces +studentId)
↓
Paso 4
Actualizar Validators (queryValidators.ts — 3 funciones +requireUuid(studentId))
↓
Paso 5
Actualizar Query Handlers (3 Handlers — propagar request.studentId al Port)
↓
Paso 6
Actualizar Request Mappers (toGetUnitDetailRequest, toGetAttemptHistoryRequest, toGetVersionFeedbackRequest → +parámetro studentId)
↓
Paso 7
Actualizar Route Handlers vulnerables (handleGetUnitDetail, handleListUnitAttempts, handleGetFeedback → +requireRole, +actor.userId)
↓
Paso 8
Actualizar call sites restantes (handleStartUnit, handleSubmitVersion, startUnitAction → pasar actor.userId a los Request Mappers ya modificados)
↓
Paso 9
Compilar (tsc --noEmit, estricto, proyecto completo)
↓
Paso 10
Ejecutar tests (orden de Tarea 7)
```

**Por qué este orden minimiza errores de compilación:** sigue estrictamente la dirección de dependencias, de adentro hacia afuera. El Paso 1 (interfaz) es el único punto que ningún otro archivo importa como dependencia — es la raíz del árbol de cambios. Cada paso siguiente solo repara las roturas introducidas por el paso inmediatamente anterior, nunca reintroduce una rotura ya reparada: el Paso 2 repara la única clase que implementa la interfaz del Paso 1; los Pasos 3-4 (DTO/Validators) son independientes entre sí y de los Pasos 1-2 (no hay import entre `QueryDto.ts`/`queryValidators.ts` y `AcademyReadModelPort.ts`/`PrismaAcademyReadModelPort.ts`), por lo que solo convergen en el Paso 5, que exige que tanto el Port (Paso 1-2) como el DTO (Paso 3) ya estén actualizados; el Paso 6 depende únicamente del Paso 3 (el Mapper construye el DTO); los Pasos 7-8 dependen únicamente del Paso 6 (llaman al Mapper con la nueva firma). Ir en cualquier otro orden (p. ej. tocar los Route Handlers antes que los Request Mappers) produciría errores de compilación prematuros sin ninguna causa raíz corregida todavía, dificultando distinguir errores "esperados en tránsito" de errores reales.

---

## Tarea 3 — Dependencias

| Cambio | Depende de | Puede romper compilación de | Debe implementarse antes de | Puede hacerse en paralelo con |
|---|---|---|---|---|
| Paso 1 — Interfaz `AcademyReadModelPort` | Nada | `PrismaAcademyReadModelPort.ts` (implementa la interfaz), los 3 Query Handlers (llaman al Port con la firma antigua) | Pasos 2, 5 | Pasos 3, 4 |
| Paso 2 — `PrismaAcademyReadModelPort.ts` | Paso 1 | Nada adicional (es una hoja del árbol de dependencias — nada importa esta clase concreta salvo el Composition Root, que no cambia su forma de invocarla) | Paso 9 (compilación final) | Pasos 3, 4 |
| Paso 3 — `QueryDto.ts` | Nada | Request Mappers (Paso 6), que construyen literales de estos DTO | Pasos 5, 6 | Pasos 1, 2, 4 |
| Paso 4 — `queryValidators.ts` | Paso 3 (usa `request.studentId`, debe existir en el tipo) | Nada (acceder a un campo ya tipado no rompe nada; omitir este paso no rompe la compilación, pero deja la validación de formato de `studentId` incompleta) | Ninguno estrictamente para compilar; sí para Definition of Done | Pasos 1, 2, 5, 6 |
| Paso 5 — 3 Query Handlers | Pasos 1, 2, 3 | Nada adicional (nadie más llama a estos Handlers salvo Route Handlers ya listados en Pasos 7-8, cuya compilación no depende de este paso) | Paso 9 | Paso 6 |
| Paso 6 — 3 Request Mappers | Paso 3 | Route Handlers que los invocan: `handleGetUnitDetail`, `handleListUnitAttempts`, `handleGetFeedback` (Paso 7) y `handleStartUnit`, `handleSubmitVersion`, `startUnitAction` (Paso 8) | Pasos 7, 8 | Pasos 1, 2, 4, 5 |
| Paso 7 — Route Handlers vulnerables | Paso 6 | Nada adicional | Paso 9 | Paso 8 |
| Paso 8 — Call sites restantes | Paso 6 | Nada adicional | Paso 9 | Paso 7 |

**Resumen de paralelización posible:** un equipo de 2 desarrolladores podría dividir el trabajo en dos frentes simultáneos — Frente 1: Pasos 1→2→5; Frente 2: Pasos 3→4→6 — que solo convergen al llegar al Paso 5 (necesita ambos frentes completos) y al Paso 7/8 (necesitan el Frente 2 completo). El Paso 9 (compilación) es el único punto de sincronización obligatorio final.

---

## Tarea 4 — Cambios de firmas

| Componente | Antes | Después |
|---|---|---|
| `AcademyReadModelPort.getUnitDetail` | `getUnitDetail(unitId: string): Promise<AcademyUnitDetailResponseDto \| null>` | `getUnitDetail(unitId: string, studentId: string): Promise<AcademyUnitDetailResponseDto \| null>` |
| `AcademyReadModelPort.listAttemptsByUnit` | `listAttemptsByUnit(unitId: string): Promise<AttemptSummaryResponseDto[]>` | `listAttemptsByUnit(unitId: string, studentId: string): Promise<AttemptSummaryResponseDto[]>` |
| `AcademyReadModelPort.getVersionFeedback` | `getVersionFeedback(attemptId: string, versionNumber: number): Promise<VersionFeedbackResponseDto \| null>` | `getVersionFeedback(attemptId: string, versionNumber: number, studentId: string): Promise<VersionFeedbackResponseDto \| null>` |
| `PrismaAcademyReadModelPort.getUnitDetail` | ídem (misma firma que el Port) | ídem (misma firma que el Port) |
| `PrismaAcademyReadModelPort.listAttemptsByUnit` | ídem | ídem |
| `PrismaAcademyReadModelPort.getVersionFeedback` | ídem | ídem |
| `GetAcademyUnitDetailRequestDto` (interfaz) | `{ readonly unitId: string }` | `{ readonly unitId: string; readonly studentId: string }` |
| `GetAttemptHistoryRequestDto` (interfaz) | `{ readonly unitId: string }` | `{ readonly unitId: string; readonly studentId: string }` |
| `GetVersionFeedbackRequestDto` (interfaz) | `{ readonly attemptId: string; readonly versionNumber: number }` | `{ readonly attemptId: string; readonly versionNumber: number; readonly studentId: string }` |
| `validateGetAcademyUnitDetailRequest` | valida solo `unitId` | valida `unitId` y `studentId` (ambos vía `requireUuid`) |
| `validateGetAttemptHistoryRequest` | valida solo `unitId` | valida `unitId` y `studentId` |
| `validateGetVersionFeedbackRequest` | valida `attemptId`, `versionNumber` | valida `attemptId`, `versionNumber`, `studentId` |
| `toGetUnitDetailRequest` (request-mapper) | `toGetUnitDetailRequest(unitId: string): GetAcademyUnitDetailRequestDto` | `toGetUnitDetailRequest(unitId: string, studentId: string): GetAcademyUnitDetailRequestDto` |
| `toGetAttemptHistoryRequest` (request-mapper) | `toGetAttemptHistoryRequest(unitId: string): GetAttemptHistoryRequestDto` | `toGetAttemptHistoryRequest(unitId: string, studentId: string): GetAttemptHistoryRequestDto` |
| `toGetVersionFeedbackRequest` (request-mapper) | `toGetVersionFeedbackRequest(attemptId: string, versionNumber: number): GetVersionFeedbackRequestDto` | `toGetVersionFeedbackRequest(attemptId: string, versionNumber: number, studentId: string): GetVersionFeedbackRequestDto` |
| `handleGetUnitDetail` (Route Handler) | `handleGetUnitDetail(unitId: string, headers: AcademyResponseHeaders): Promise<NextResponse>` | Misma firma externa (sin cambio de parámetros); internamente captura `actor`, añade `requireRole(actor, ["STUDENT"])`, pasa `actor.userId` al Request Mapper |
| `handleListUnitAttempts` (Route Handler) | Sin cambio de firma externa | Internamente captura `actor`, añade `requireRole(actor, ["STUDENT"])`, pasa `actor.userId` |
| `handleGetFeedback` (Route Handler) | Sin cambio de firma externa | Internamente captura `actor`, añade `requireRole(actor, ["STUDENT"])`, pasa `actor.userId` |

Ningún constructor de clase cambia de firma (Composition Root sin cambios, confirmado en Tarea 1).

---

## Tarea 5 — Impacto de compilación

| Archivo | Deja de compilar en el Paso | Vuelve a compilar en el Paso |
|---|---|---|
| `PrismaAcademyReadModelPort.ts` | Paso 1 (clase ya no implementa la interfaz actualizada) | Paso 2 |
| `GetAcademyUnitDetailHandler.ts` | Paso 1 (llama a `getUnitDetail` con un solo argumento) | Paso 5 |
| `GetAttemptHistoryHandler.ts` | Paso 1 | Paso 5 |
| `GetVersionFeedbackHandler.ts` | Paso 1 | Paso 5 |
| `unitRequestMappers.ts` (`toGetUnitDetailRequest`, `toGetAttemptHistoryRequest`) | Paso 3 (el literal de retorno ya no satisface el DTO, le falta `studentId`) | Paso 6 |
| `attemptRequestMappers.ts` (`toGetVersionFeedbackRequest`) | Paso 3 | Paso 6 |
| `unitsHandlers.ts` (`handleGetUnitDetail`, `handleListUnitAttempts`, `handleStartUnit`) | Paso 6 (llaman a los Request Mappers con la firma antigua, ahora insuficiente) | Pasos 7 (los dos primeros) y 8 (`handleStartUnit`) |
| `attemptsHandlers.ts` (`handleGetFeedback`, `handleSubmitVersion`) | Paso 6 | Pasos 7 (`handleGetFeedback`) y 8 (`handleSubmitVersion`) |
| `actions/unitActions.ts` (`startUnitAction`) | Paso 6 | Paso 8 |

**Dependencias transitivas verificadas:** ningún archivo `route.ts` (`app/api/v1/academy/**`) importa directamente `AcademyReadModelPort`, `QueryDto.ts` ni los Request Mappers — solo importan las funciones `handle*` de `features/academy/api/handlers`, cuya firma externa no cambia (Tarea 4) — por lo tanto ningún archivo `route.ts` deja de compilar en ningún paso. `features/academy/actions/attemptActions.ts` fue verificado y no importa `toGetVersionFeedbackRequest` ni `getVersionFeedback` — no se ve afectado en ningún paso.

Entre el Paso 1 y el Paso 9, el proyecto completo **no compila** (`tsc --noEmit` fallará con errores intermedios esperados) — esto es normal y esperado dentro de una misma rama/PR de trabajo; el requisito de compilación limpia aplica únicamente al estado final (post-Paso 9), no a los estados intermedios.

---

## Tarea 6 — Estrategia de implementación

**Big Bang** (un único cambio atómico, no incremental/feature-flagged).

Justificación: el cambio de firma de una interfaz TypeScript con parámetros obligatorios (no opcionales) hace que el propio compilador estricto obligue a actualizar todos los call sites en el mismo cambio — no existe un estado intermedio "parcialmente migrado" que compile. Intentar una migración incremental (p. ej. desplegar el Port actualizado sin actualizar todavía los Route Handlers) simplemente no compilaría, por lo que no es una opción técnica real, no solo una preferencia. Adicionalmente, se trata de la remediación de una vulnerabilidad de seguridad ya confirmada (BOLA, ACA-003/004) — prolongar el despliegue en fases incrementales extendería la ventana de exposición sin beneficio, dado que el conjunto de archivos afectados es pequeño (12 archivos) y está completamente acotado y enumerado (Tarea 1). Se recomienda un único Pull Request que contenga los Pasos 1-8 completos, revisado y fusionado como una unidad.

---

## Tarea 7 — Estrategia de pruebas

```
Compilación
↓
Unit Tests
↓
Application Tests
↓
Integration Tests
↓
Authorization Tests
↓
Regression Tests
↓
Security Tests
```

- **Compilación** (`tsc --noEmit`, proyecto completo): valida que los tipos son consistentes de punta a punta — condición necesaria antes de ejecutar cualquier prueba en tiempo de ejecución.
- **Unit Tests**: validan en aislamiento (con mocks de `AcademyReadModelPort`) que `GetAcademyUnitDetailHandler`, `GetAttemptHistoryHandler`, `GetVersionFeedbackHandler` propagan correctamente `request.studentId` al Port, y que `validateGetAcademyUnitDetailRequest`/`validateGetAttemptHistoryRequest`/`validateGetVersionFeedbackRequest` rechazan un `studentId` con formato inválido.
- **Application Tests**: validan el comportamiento de `PrismaAcademyReadModelPort` contra una base de datos de prueba real (o PGlite, ya usado en sprints previos de Mi Plan/Academia) — confirman que `getUnitDetail`/`listAttemptsByUnit`/`getVersionFeedback` devuelven `null`/vacío cuando el `studentId` no coincide con el propietario real de la fila.
- **Integration Tests**: validan el flujo HTTP completo (Route Handler → Application → Infrastructure) para EP-14, EP-16, EP-18, incluyendo la propagación de `actor.userId` desde `resolveAcademyActor()`.
- **Authorization Tests**: validan específicamente los códigos HTTP de autorización — `403` para rol incorrecto, `404` para recurso ajeno o inexistente (sin distinción, per Contrato Sección 11), `401` para ausencia de JWT.
- **Regression Tests**: validan que EP-01 (`handleStartUnit`/`startUnitAction`) y EP-03 (`handleSubmitVersion`) siguen funcionando exactamente igual que antes del cambio, dado que ambos son call sites existentes de los Query Handlers modificados.
- **Security Tests**: repetición del árbol de evidencia de ACA-003 (Pasos 3-5 de ese informe) contra el código ya modificado, confirmando que el bypass "POSIBLE" identificado entonces ahora es "NO POSIBLE" para los tres endpoints.

---

## Tarea 8 — Casos obligatorios de prueba

- ✓ Recurso propio: estudiante A solicita su propio `unitId`/`attemptId` en EP-14/16/18 → `200 OK` con el DTO esperado, sin cambios de comportamiento respecto a hoy.
- ✓ Recurso ajeno: estudiante A solicita un `unitId`/`attemptId` del estudiante B → `404 Not Found` (nunca `200 OK`).
- ✓ UUID inexistente: `unitId`/`attemptId` con formato válido pero sin fila asociada → `404 Not Found`.
- ✓ JWT ausente: request sin sesión Clerk válida → `401 Unauthorized` (sin cambios, ya cubierto por el middleware).
- ✓ Rol incorrecto: actor con rol `TEACHER` llamando EP-14/16/18 (ahora exigen `STUDENT`) → `403 Forbidden` con `ACADEMY_FORBIDDEN_ROLE`.
- ✓ IDs manipulados: variación sistemática del `unitId`/`attemptId` de la URL con valores de otros estudiantes conocidos en el set de datos de prueba → siempre `404`, nunca fuga de datos.
- ✓ Regresión EP-01: `handleStartUnit`/`startUnitAction`, camino de recuperación de conflicto (`ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE`) → debe seguir devolviendo el intento activo correcto del propio estudiante tras el cambio de firma de `getAttemptHistory`.
- ✓ Regresión EP-03: `handleSubmitVersion`, rama `feedbackStatus === "READY"` → debe seguir devolviendo el feedback correcto tras el cambio de firma de `getVersionFeedback`.
- ✓ Compilación completa: `tsc --noEmit` sin errores en todo el proyecto (no solo en `features/academy`).
- Adicional 1 — Formato de `studentId` inválido: si por error interno `actor.userId` llegara vacío o mal formado (no debería ocurrir dado que proviene de `resolveAcademyActor()`, pero debe probarse como caso defensivo) → `400` vía `validateGet*Request`, no un `500`.
- Adicional 2 — Paginación intacta en EP-16: confirmar que `paginate()` sigue operando correctamente sobre la lista ya filtrada por `studentId` (el filtro no debe alterar la forma del DTO paginado).
- Adicional 3 — EP-19/EP-20/EP-23 y los 5 Query Handlers restantes no tocados: prueba de humo de que sus respuestas no cambiaron (control negativo, confirma que el cambio no tuvo efectos colaterales fuera del alcance).

---

## Tarea 9 — Rollback

- **Archivos a revertir:** los 12 archivos listados en la Tarea 1, en un único revert (todos pertenecen al mismo commit/PR atómico, per Tarea 6 — Big Bang).
- **Orden de reversión:** no aplica un orden especial — al ser un único commit atómico, `git revert` (o descarte del PR) deshace los 12 archivos simultáneamente; no hay una secuencia de reversión parcial segura, dado que revertir solo un subconjunto reproduciría los mismos errores de compilación intermedios descritos en la Tarea 5.
- **Datos que podrían quedar inconsistentes:** ninguno. La remediación no escribe datos, no migra filas, no cambia ningún esquema — es exclusivamente lectura (`GET`) con un filtro adicional. No hay estado persistido que revertir además del código.
- **Riesgo de migraciones:** ninguno. Confirmado en el ACP-002 y en esta blueprint: no se modifica `prisma/schema.prisma` ni se genera ninguna migración nueva. El rollback es puramente de código fuente.

---

## Tarea 10 — Checklist

```
□ Interfaz AcademyReadModelPort actualizada (3 firmas)
□ PrismaAcademyReadModelPort actualizado (3 métodos, filtro por studentId aplicado)
□ QueryDto.ts actualizado (3 interfaces +studentId)
□ queryValidators.ts actualizado (3 funciones +requireUuid(studentId))
□ GetAcademyUnitDetailHandler actualizado (propaga studentId)
□ GetAttemptHistoryHandler actualizado (propaga studentId)
□ GetVersionFeedbackHandler actualizado (propaga studentId)
□ unitRequestMappers.ts actualizado (toGetUnitDetailRequest, toGetAttemptHistoryRequest +studentId)
□ attemptRequestMappers.ts actualizado (toGetVersionFeedbackRequest +studentId)
□ handleGetUnitDetail actualizado (+requireRole, +actor.userId)
□ handleListUnitAttempts actualizado (+requireRole, +actor.userId)
□ handleGetFeedback actualizado (+requireRole, +actor.userId)
□ handleStartUnit actualizado (call site de toGetAttemptHistoryRequest)
□ handleSubmitVersion actualizado (call site de toGetVersionFeedbackRequest)
□ startUnitAction actualizado (call site de toGetAttemptHistoryRequest)
□ Composition Root verificado sin cambios (confirmar que no fue tocado)
□ Domain verificado sin cambios (confirmar que no fue tocado)
□ Compilación (tsc --noEmit) OK, proyecto completo, cero errores
□ Unit Tests OK
□ Application Tests OK
□ Integration Tests OK
□ Authorization Tests OK
□ Regression Tests OK (EP-01, EP-03, y 5 Query Handlers no tocados)
□ Security Tests OK (re-ejecución del árbol de evidencia de ACA-003 sobre el código nuevo)
```

---

## Tarea 11 — Riesgos finales

- Riesgo de olvidar un call site no enumerado: mitigado por el propio compilador estricto (un `studentId` obligatorio no opcional hará fallar la compilación en cualquier call site no actualizado) — riesgo residual bajo, pero exige que el Paso 9 se ejecute sobre el proyecto completo, no solo sobre `features/academy`.
- Riesgo en `getVersionFeedback`: el cambio de `findUnique` a `findFirst` (necesario para añadir el filtro por relación `attempt.academyUnit.studentId`) depende de que la clave compuesta `attemptId_versionNumber` siga garantizando unicidad en la práctica — si esa suposición fuera incorrecta, `findFirst` podría devolver una fila distinta a la esperada bajo datos anómalos; se mitiga con el caso de prueba de Application Tests contra datos reales/PGlite.
- Riesgo de doble mantenimiento no cerrado por este Sprint: `handleSubmitVersion`/`submitVersionAction` siguen — fuera del alcance de esta remediación (ya documentado como H-03/H-10 en ACA-002, no parte de H-01) — duplicando lógica entre Route Handler y Server Action; no se reabre esta discusión, solo se deja constancia de que no se resuelve en este Sprint.
- Riesgo de cobertura de test insuficiente: no existen tests previos en `features/academy` (confirmado) — todo el plan de pruebas de las Tareas 7-8 debe crearse desde cero, no hay una base existente sobre la que apoyarse; esto aumenta el esfuerzo de este Sprint respecto a un escenario con suite de tests preexistente.
- Riesgo de que el equipo interprete el "refuerzo opcional" del ACP-002 (`withStudentContext`) como parte obligatoria de este Sprint: debe aclararse antes de empezar que el ACP-002 lo dejó como pregunta abierta, no como parte de la solución aprobada para esta iteración — de lo contrario se corre el riesgo de ampliar el alcance sin autorización.

---

## Definition of Done

La implementación de Sprint 6.3.1 solo podrá cerrarse cuando **todos** los siguientes criterios se cumplan:

1. Los 12 archivos de la Tarea 1 están modificados exactamente como se especifica en la Tarea 4 (firmas) — ni más ni menos archivos.
2. El Composition Root (`academyContainer.ts`) y todo `features/academy/domain/` permanecen sin ninguna modificación (verificable por diff vacío).
3. `tsc --noEmit` compila el proyecto completo con cero errores nuevos.
4. Los 12 casos de prueba obligatorios de la Tarea 8 pasan, incluyendo los 3 casos adicionales.
5. Una auditoría de validación posterior (equivalente en método a ACA-003/004) ejecutada sobre el código ya modificado concluye `H-01 DESCARTADO` para EP-14, EP-16 y EP-18.
6. Ningún Query Handler de Academia importa ni invoca un Repository de Domain ni carga un Aggregate (verificable por ausencia de imports de `domain/repositories`/`domain/aggregates` en los 3 Query Handlers modificados) — confirma que se preservó CQRS y se evitó la Opción A descartada en el ACP-002.
7. Los 5 Query Handlers de Academia no incluidos en este Sprint (EP-13, EP-15, EP-19, EP-20, EP-23, etc.) no presentan ningún cambio de comportamiento observable (prueba de humo de regresión).

---

## Veredicto Final

A) READY TO IMPLEMENT

Justificación basada exclusivamente en evidencia del ACP-002: el ACP-002 dejó únicamente dos preguntas abiertas, ambas explícitamente marcadas como no bloqueantes para el diseño ("no bloquean el diseño, sí determinan si se implementa la variante base o la reforzada") y referidas exclusivamente al refuerzo opcional de `withStudentContext`/RLS literal — un componente que el propio ACP-002 excluye de la solución base aprobada. La solución base (extender `AcademyReadModelPort`, propagar `studentId`, aplicar el filtro en el Read Model, añadir `requireRole()`, devolver 404 unificado) no tiene ninguna decisión arquitectónica pendiente: el ACP-002 identificó con precisión los 12 archivos, sus firmas exactas antes/después, y confirmó explícitamente "sin cambios" para Domain y Composition Root. No queda ninguna ambigüedad de diseño para que otro desarrollador deba resolver por su cuenta.
