## Runtime Validation Report

### Resumen Ejecutivo

Este entorno de sesión **no dispone** de base de datos PostgreSQL activa, dependencias del proyecto instaladas (`node_modules` real, no el harness de solo-tipos), credenciales de Clerk, ni un servidor Next.js en ejecución. Por lo tanto, ninguno de los 7 casos de la Tarea 1 (verificación funcional HTTP), la Tarea 2 (regresión funcional) ni la Tarea 7 (evidencia de request/response reales) pudo ejecutarse. Conforme a la instrucción explícita de este encargo, no se simula ningún resultado de estos casos. Sí se ejecutó, con evidencia concreta, la Tarea 6 (regresión arquitectónica, verificable estáticamente sin runtime) y una verificación estática parcial de Tareas 3/4 (trazabilidad de código contra el texto del API Contract y del Application Model, no ejecución real de HTTP). El veredicto es **VALIDATION NOT EXECUTABLE**, con el detalle exacto de lo que falta y lo que debe ejecutarse antes de cerrar H-01.

---

### Resultados por Endpoint

**EP-14 — GET /units/{unitId}**
No ejecutable. Se requiere: servidor Next.js activo, sesión Clerk válida, base de datos con al menos 2 estudiantes y unidades propias de cada uno. Verificación estática disponible (trazabilidad de código, no ejecución): `handleGetUnitDetail` (`unitsHandlers.ts`) llama `requireRole(actor, ["STUDENT"])` y pasa `actor.userId` a `toGetUnitDetailRequest`; `PrismaAcademyReadModelPort.getUnitDetail` ejecuta `findFirst({ where: { id: unitId, studentId } })`. La ruta de código es consistente con el comportamiento esperado, pero esto es un TRACE de código, no una ejecución HTTP real.

**EP-16 — GET /units/{unitId}/attempts**
No ejecutable, mismas dependencias faltantes que EP-14. Trace de código: `handleListUnitAttempts` llama `requireRole` y pasa `actor.userId`; `listAttemptsByUnit` filtra por `academyUnit: { studentId }`.

**EP-18 — GET /attempts/{attemptId}/feedback**
No ejecutable, mismas dependencias faltantes. Trace de código: `handleGetFeedback` llama `requireRole` y pasa `actor.userId`; `getVersionFeedback` filtra por `attempt: { academyUnit: { studentId } }`.

Ninguno de los 7 casos (recurso propio, recurso ajeno, UUID inexistente, JWT ausente, JWT inválido, rol incorrecto, manipulación de IDs) tiene una respuesta HTTP real registrada en este informe.

---

### Regresión

**EP-01, EP-03, EP-05**
No ejecutable. Trace de código (no ejecución): los 3 call sites internos identificados y corregidos en Sprint 6.3.2 (`handleStartUnit`/`startUnitAction` → `toGetAttemptHistoryRequest`; `handleSubmitVersion` → `toGetVersionFeedbackRequest`; `handleCompleteReflection` → `toGetUnitDetailRequest`) compilan correctamente con `actor.userId` ya disponible en su propio scope (verificado por `tsc --noEmit`, 0 errores nuevos, en Sprint 6.3.2). Esto confirma consistencia de tipos, no equivalencia funcional en tiempo de ejecución — no se puede afirmar sin ejecutar el flujo real que el comportamiento observable de EP-01/03/05 sea idéntico al previo.

---

### Verificación del API Contract

**NO EJECUTABLE (parcial: trazabilidad de código disponible, no verificación en tiempo de ejecución)**

Se confirma por lectura de código que `handleGetUnitDetail`, `handleListUnitAttempts` y `handleGetFeedback` ahora invocan `requireRole(actor, ["STUDENT"])` (antes ausente) y propagan `actor.userId` como ownership — consistente con "Autorización: JWT + rol STUDENT + RLS" (API Contract v1.3, EP-14/16/18) en cuanto a rol y ownership. No se puede confirmar la ejecución real de una respuesta `404` (Sección 11, "nunca se distingue de no autorizado") sin invocar el endpoint de verdad contra datos de otro estudiante.

---

### Verificación del Application Model

**NO EJECUTABLE (parcial: trazabilidad de código disponible)**

El requisito "Estudiante: solo puede invocar Commands/Queries sobre sus propias AcademyUnit/Attempt (ownership por StudentId)" (Sección 13) está reflejado en el código de los 3 Query Handlers y de `PrismaAcademyReadModelPort` (filtro por `studentId` en las 3 consultas). No se puede emitir PASS/FAIL definitivo sin ejecutar el filtro contra una base de datos real con al menos dos estudiantes y confirmar que la fila de un estudiante distinto nunca se retorna.

---

### Verificación OWASP API1:2023

**NO EJECUTABLE**

No se puede confirmar PASS ni FAIL de "Broken Object Level Authorization" sin una prueba de explotación real (Caso 2/Caso 7) ejecutada contra el sistema en funcionamiento. Afirmar PASS sin ejecución sería exactamente el tipo de conclusión sin evidencia que este encargo prohíbe explícitamente.

---

### Regresión arquitectónica (Tarea 6 — verificable sin runtime, SÍ ejecutada)

| Punto | Resultado | Evidencia |
|---|---|---|
| Acceso a Repository desde Query Handlers | PASS | `grep` de imports en `GetAcademyUnitDetailHandler.ts`, `GetAttemptHistoryHandler.ts`, `GetVersionFeedbackHandler.ts`: únicamente importan `Query`, DTO, `validators`, `exceptions` y `AcademyReadModelPort` — cero imports de `domain/repositories` o `domain/aggregates`. |
| Aggregate en lecturas | PASS | Mismo grep — ningún import de clases de Aggregate (`AcademyUnit`, `Attempt`) en los 3 Handlers. |
| Doble consulta introducida por el cambio | PASS | Lectura directa de `PrismaAcademyReadModelPort.ts`: `getUnitDetail` mantiene su patrón preexistente (fila principal + predecesor, ya presente antes de esta remediación, sin relación con `studentId`); `listAttemptsByUnit` y `getVersionFeedback` siguen ejecutando exactamente una consulta cada una — el filtro por `studentId` se añadió al `WHERE` existente, no como una consulta adicional. |
| Cambios en Composition Root | PASS | `academyContainer.ts` líneas 398/400/401: `new GetAcademyUnitDetailHandler(ports.readModel)`, `new GetAttemptHistoryHandler(ports.readModel)`, `new GetVersionFeedbackHandler(ports.readModel)` — idénticos a antes de Sprint 6.3.2, un solo argumento cada uno. |
| Nuevas dependencias | PASS | Mismo punto anterior — ningún constructor ganó un parámetro nuevo. |
| Ruptura de CQRS | PASS | Consecuencia directa de los 2 primeros puntos — los Query Handlers siguen dependiendo EXCLUSIVAMENTE de `AcademyReadModelPort`. |

---

### Riesgo residual

**Alto**

Justificación: aunque el código fue implementado y compila correctamente (verificado en Sprint 6.3.2) y la revisión estática de esta sesión no encontró ninguna regresión arquitectónica, **no existe ninguna evidencia de ejecución real** de que el BOLA haya desaparecido en tiempo de ejecución. Un error de implementación sutil (p. ej. un typo en el nombre de la relación Prisma, un `studentId` que llegue vacío por un fallo silencioso en `resolveAcademyActor()`, o un comportamiento distinto de `findFirst` frente a datos reales con filas duplicadas) no sería detectado por la compilación de TypeScript ni por la revisión estática — solo por una ejecución real contra una base de datos con datos de al menos dos estudiantes. Hasta que se ejecute esa prueba, el riesgo de que el BOLA persista de forma no detectada se mantiene Alto, no Bajo ni Ninguno.

---

### Definition of Done (Blueprint Sprint 6.3.1) — verificación uno por uno

1. Los 12 archivos modificados exactamente como se especifica: **Cumplido** (verificado en el informe de Sprint 6.3.2, con una corrección de alcance disclosed — call site adicional en EP-05).
2. Composition Root y Domain sin ninguna modificación: **Cumplido** (verificado por diff/grep en esta sesión, Tarea 6 arriba).
3. `tsc --noEmit` compila sin errores nuevos: **Cumplido** (verificado en Sprint 6.3.2).
4. Los 12 casos de prueba obligatorios de la Tarea 8 del Blueprint pasan: **NO verificado** — ninguno de los 12 casos fue ejecutado en tiempo de ejecución en ningún Sprint hasta ahora.
5. Auditoría de validación posterior concluye `H-01 DESCARTADO`: **NO verificado** — este mismo informe es esa auditoría, y su conclusión es "no ejecutable", no "descartado".
6. Ningún Query Handler importa Repository/Aggregate de Domain: **Cumplido** (Tarea 6).
7. Los 5 Query Handlers no tocados no presentan cambio de comportamiento: **NO verificado en tiempo de ejecución** — solo verificado que sus archivos no fueron modificados (verificación de código, no de comportamiento observado).

**Conclusión de Definition of Done: 4 de 7 criterios cumplidos; 3 de 7 no verificables sin runtime.**

---

### Dependencias faltantes para ejecutar esta validación

- **PostgreSQL**: no hay instancia activa ni `DATABASE_URL` configurada (solo existe `.env.example`, sin `.env` real).
- **Dependencias del proyecto**: no hay `node_modules` real instalado en la raíz del proyecto (`npm install` no se ejecutó; solo existe un harness aislado de solo-tipos en `/tmp/academy-infra-check` usado exclusivamente para `tsc --noEmit`, sin capacidad de ejecutar Prisma Client real ni Next.js).
- **Prisma Client generado**: `prisma generate` no se ejecutó contra una base de datos real (verificado: sin conexión disponible).
- **Next.js runtime**: no hay servidor `next dev`/`next start` en ejecución; no se puede emitir ninguna request HTTP real a `/api/v1/academy/*`.
- **Clerk**: no hay credenciales de prueba ni variables de entorno de Clerk configuradas; no es posible generar un JWT válido, uno inválido, ni una sesión sin JWT de forma realista contra el middleware real.
- **Datos de prueba (seed)**: no se confirmó la existencia de un seed con al menos 2 estudiantes, cada uno con `AcademyUnit`/`Attempt`/`Version`/`Feedback` propios, necesario para el Caso 2 (recurso ajeno) y el Caso 7 (manipulación de IDs).
- **Suite de tests**: no existen archivos `*.test.ts`/`*.spec.ts` en `features/academy` (confirmado por búsqueda) — el `vitest.config.ts` existe a nivel de proyecto, pero no hay tests de Academia que ejecutar con `npm run test`.

### Pruebas que deben ejecutarse en CI, staging o entorno local antes de cerrar H-01

1. `npm install` + `prisma generate` + `prisma migrate deploy` (o `dev`) contra una base de datos Postgres real o efímera (contenedor de CI).
2. Ejecutar (o crear, si no existen) un seed con al menos 2 estudiantes (`A`, `B`), cada uno con al menos 1 `AcademyUnit` en estado que permita ejercitar EP-14/16/18, y al menos 1 `Attempt`/`Version`/`Feedback` para `B`.
3. Levantar `next dev` (o `next start` sobre un build) con Clerk configurado en modo de test (o un doble de autenticación que permita emitir un JWT válido para `A` y para `B`).
4. Ejecutar los 7 casos de la Tarea 1 de este encargo contra el servidor real: `GET /units/{unitId de B}` autenticado como `A` → confirmar `404` real (Caso 2); repetir para EP-16/EP-18.
5. Ejecutar los casos de JWT ausente/inválido y rol incorrecto (Casos 4-6) contra el middleware real.
6. Ejecutar el caso de manipulación sistemática de IDs (Caso 7) con un fuzzing acotado sobre `unitId`/`attemptId`/`versionNumber` conocidos de `B`, autenticado como `A`.
7. Ejecutar el flujo completo de EP-01 (incluyendo el camino de conflicto `ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE`), EP-03 (incluyendo la rama `feedbackStatus: READY`) y EP-05, confirmando que su comportamiento observable no cambió respecto al existente antes de Sprint 6.3.2.
8. Solo si los pasos 4-7 pasan sin excepciones, una auditoría de cierre (mismo método que ACA-003/004) puede emitir `H-01 DESCARTADO` con evidencia de ejecución real, no solo de código.

---

### Veredicto Final

D) VALIDATION NOT EXECUTABLE
