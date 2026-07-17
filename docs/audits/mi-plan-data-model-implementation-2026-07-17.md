# Sprint 3.3.1 — Implementación del Modelo de Datos de Mi Plan

**Fecha:** 2026-07-17
**Rol:** Principal Software Engineer, Database Architect, Prisma Expert y PostgreSQL Specialist
**Alcance:** exclusivamente persistencia (schema, migraciones, RLS). Sin dominio, servicios, casos de uso, APIs ni UI.
**Fuente de verdad:** `02_Conocimiento_Consolidado_Resuelto.md` — sección 13.4, resoluciones 18.1–18.21, `docs/modules/mi-plan.md` (Arquitectura Definitiva), auditorías de Fase 3.1/3.2.

---

## 1. Resumen ejecutivo

Se implementaron las 6 entidades de 13.4 que aún no existían en `schema.prisma` (`LearningGoal`, `LearningObjective`, `LearningPhase`, `LearningTask`, `StudySchedule`, `StudySession`), sus 6 ENUM oficiales (valores de la resolución 18.21), todas las relaciones con `LearningPlan`/`User`, la convención de nomenclatura `pk_`/`fk_`/`uq_`/`idx_`/`ck_` (13.13) desde el origen, 13 índices justificados y el patrón de RLS ya auditado del Dashboard (`dashboard_app_role` / `dashboard_service_role`).

`LearningPlan`, `WeeklyPlan`, `DailyPlan` y `LearningProgress` no se modificaron estructuralmente; solo recibieron los `GRANT` de escritura para `dashboard_service_role` que nunca habían tenido.

Todo el conjunto (6 tablas + 6 ENUM + 32 objetos regulados por 13.13 + 2 migraciones + políticas RLS) se verificó empíricamente con PGlite (Postgres 17 real vía WASM) sobre la cadena completa de migraciones del proyecto, incluida la reversibilidad exacta de ambas migraciones nuevas. Durante la auditoría se detectaron y corrigieron 3 inconsistencias reales (detalladas en la sección 9) antes de cerrar el sprint, cumpliendo la instrucción de no dejar deuda técnica.

**Veredicto: 🟢 MODELO DE DATOS IMPLEMENTADO Y APROBADO** (justificación en la sección 11).

---

## 2. Entidades creadas

| Entidad | Tabla | Rol en 13.4 | Ciclo de vida propio (18.21) |
|---|---|---|---|
| `LearningGoal` | `learning_goal` | Meta de aprendizaje, hija de `LearningPlan` | Sí — `status` calculado automáticamente a partir de sus `LearningObjective` |
| `LearningObjective` | `learning_objective` | Objetivo concreto, hijo de `LearningGoal` | Sí — se completa manualmente |
| `LearningPhase` | `learning_phase` | Fase del calendario, hija de `LearningPlan` | Sí — `status` calculado automáticamente a partir de sus `LearningTask` |
| `LearningTask` | `learning_task` | Tarea ejecutable, hija de `LearningPhase` | Sí — manual solo si `source = SELF_DIRECTED`; si no, exclusivamente por evento |
| `StudySchedule` | `study_schedule` | Disponibilidad operativa del plan (1:1 con `LearningPlan`, 18.20.6) | No — sin `status` propio, es configuración |
| `StudySession` | `study_session` | Registro de una sesión de estudio de una tarea | No — hecho consumado, sin `status` propio (`completed: boolean`) |

Ninguna de las 4 entidades preexistentes (`LearningPlan`, `WeeklyPlan`, `DailyPlan`, `LearningProgress`) fue modificada estructuralmente; `LearningPlan` y `User` solo recibieron los campos de relación inversa que Prisma exige de forma aditiva (`learningGoals`, `learningPhases`, `studySchedule`, `studySessions`).

---

## 3. ENUM creados

| ENUM | Valores | Origen |
|---|---|---|
| `LearningGoalStatus` | `NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED` | 18.21 |
| `LearningObjectiveStatus` | `NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED` | 18.21 |
| `LearningPhaseStatus` | `NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED` | 18.21 |
| `LearningTaskStatus` | `NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED` | 18.21 |
| `LearningTaskDifficulty` | `EASY, MEDIUM, HARD, EXPERT` | 13.4 (ficha original de `LearningTask`) |
| `LearningTaskSource` | `SELF_DIRECTED, ACADEMY, LABORATORY, DAILY_TRAINING, SIMULATOR` | 18.20.5, consolidado en 13.4 por 18.21 |

Ningún valor inventado: los 4 ENUM de estado reutilizan exactamente el vocabulario aprobado en 18.21 (deliberadamente sin `ACTIVE`/`PAUSED`, reservados a `LearningPlanStatus`).

---

## 4. Relaciones implementadas

| Relación | Cardinalidad | Cascada | Opcionalidad |
|---|---|---|---|
| `LearningPlan` → `LearningGoal` | 1:N | `ON DELETE CASCADE` | `learning_plan_id` obligatorio |
| `LearningGoal` → `LearningObjective` | 1:N | `ON DELETE CASCADE` | `learning_goal_id` obligatorio |
| `LearningPlan` → `LearningPhase` | 1:N | `ON DELETE CASCADE` | `learning_plan_id` obligatorio |
| `LearningPhase` → `LearningTask` | 1:N | `ON DELETE CASCADE` | `learning_phase_id` obligatorio |
| `LearningPlan` → `StudySchedule` | 1:1 | `ON DELETE CASCADE` | `learning_plan_id` obligatorio + `UNIQUE` |
| `User` → `StudySession` | 1:N | `ON DELETE RESTRICT` (mismo patrón que el resto de FKs hacia `user`) | `student_id` obligatorio |
| `LearningTask` → `StudySession` | 1:N | `ON DELETE CASCADE` | `learning_task_id` obligatorio |

Las dos ramas bajo `LearningPlan` (Goal→Objective y Phase→Task) son independientes entre sí, tal como fija la nota de relaciones de 13.4 — ninguna tabla nueva las anida.

---

## 5. Constraints implementadas

32 objetos regulados por 13.13 en las 6 tablas nuevas, el 100% conforme a la convención `pk_<tabla>` / `fk_<tabla>_<columna>` / `uq_<tabla>_<columnas>` / `ck_<tabla>_<regla>` (verificado empíricamente, ver sección 8 de la verificación PGlite):

- **6 `PRIMARY KEY`:** `pk_learning_goal`, `pk_learning_objective`, `pk_learning_phase`, `pk_learning_task`, `pk_study_schedule`, `pk_study_session`.
- **7 `FOREIGN KEY`:** `fk_learning_goal_learning_plan_id`, `fk_learning_objective_learning_goal_id`, `fk_learning_phase_learning_plan_id`, `fk_learning_task_learning_phase_id`, `fk_study_schedule_learning_plan_id`, `fk_study_session_student_id`, `fk_study_session_learning_task_id`.
- **1 `UNIQUE`:** `uq_study_schedule_learning_plan_id` (garantiza la relación 1:1 de 18.20.6).
- **5 `CHECK`:** `ck_learning_goal_completed_at_consistency`, `ck_learning_objective_completed_at_consistency`, `ck_learning_phase_completed_at_consistency`, `ck_learning_task_completed_at_consistency` (las 4 aplican el invariante `completed_at IS NOT NULL ⟺ status = 'COMPLETED'` de 18.21), y `ck_study_session_duration_minutes` (`duration_minutes IS NULL OR duration_minutes >= 0`).

Las 4 CHECK del invariante `completed_at`/`status` se verificaron empíricamente: rechazan tanto asignar `completed_at` sin `status = COMPLETED` como dejar `status != COMPLETED` con un `completed_at` residual, y aceptan correctamente la transición conjunta en ambos sentidos.

---

## 6. Índices creados

13 índices, todos con nombre `idx_<tabla>_<columnas>`, cada uno justificado por una consulta real de un módulo ya especificado:

| Índice | Soporta |
|---|---|
| `idx_learning_goal_learning_plan_id` / `_status` | Bloque "Objetivos y metas" de Mi Plan |
| `idx_learning_objective_learning_goal_id` / `_status` | Sub-lista de objetivos de una meta; cálculo automático de `LearningGoal.status` |
| `idx_learning_phase_learning_plan_id` / `_status` | Bloque "Fases y tareas"; calendario del plan |
| `idx_learning_task_learning_phase_id` / `_status` | Listado de tareas de una fase; cálculo automático de `LearningPhase.status` |
| `idx_learning_task_source` | Learning Planner / evento `EXTERNAL_ACTIVITY_COMPLETED` |
| `idx_learning_task_due_date` | Vista de calendario, Dashboard/Mi Plan |
| `idx_study_session_student_id` / `_learning_task_id` | RLS y navegación tarea→sesiones |
| `idx_study_session_student_id_started_at` | Job de reorganización por inactividad (umbral de 3 días, 18.21) |

No se creó índice adicional para `study_schedule.learning_plan_id`: la restricción `UNIQUE` ya provee ese índice.

---

## 7. Migraciones creadas

| Migración | Contenido | Depende de |
|---|---|---|
| `202607171300_my_plan_schema` | 6 ENUM + 6 tablas + 19 constraints + 13 índices | `202607161000_dashboard_read_schema` |
| `202607171400_my_plan_rls_policies` | RLS + políticas + GRANT de las 6 tablas nuevas, más el `GRANT SELECT, INSERT, UPDATE` corregido sobre las 4 tablas preexistentes | `202607171300_my_plan_schema` |

Ninguna migración anterior fue modificada. Ambas incluyen `rollback.sql` y se verificaron íntegramente reversibles con PGlite: tras aplicar y luego revertir ambas (en orden inverso), el esquema resultante es idéntico byte a byte (tablas, tipos ENUM y columnas de las 4 tablas preexistentes) al estado previo a este sprint.

---

## 8. Políticas RLS

Mismo patrón que el Dashboard: `ENABLE`/`FORCE ROW LEVEL SECURITY`, roles `dashboard_app_role` (`NOBYPASSRLS`) y `dashboard_service_role` (`BYPASSRLS`), función `current_student_id()` fijada por `withStudentContext.ts`.

| Tabla | `dashboard_app_role` | `dashboard_service_role` |
|---|---|---|
| `learning_goal` | SELECT | SELECT, INSERT, UPDATE |
| `learning_phase` | SELECT | SELECT, INSERT, UPDATE |
| `learning_objective` | SELECT, UPDATE (propia) | SELECT, INSERT, UPDATE |
| `learning_task` | SELECT, UPDATE (propia, **solo si `source = SELF_DIRECTED`**, exigido en `USING` y `WITH CHECK`) | SELECT, INSERT, UPDATE |
| `study_schedule` | SELECT, UPDATE (propia) | SELECT, INSERT, UPDATE |
| `study_session` | SELECT, INSERT, UPDATE (propia) | SELECT, INSERT, UPDATE |
| `learning_plan` / `daily_plan` / `weekly_plan` / `learning_progress` (existentes) | SELECT (sin cambios) | + SELECT, INSERT, UPDATE (nuevo) |

Ningún rol recibe `DELETE` en ninguna tabla (18.20.7). `learning_goal`/`learning_phase` son de solo lectura para el estudiante porque su `status` se calcula automáticamente (mismo criterio ya aplicado a `student_dashboard`).

Verificado empíricamente con PGlite: aislamiento correcto por estudiante en las tablas de indirección simple (`learning_goal`, `learning_phase`, `study_schedule`) y doble (`learning_objective` vía `learning_goal`→`learning_plan`, `learning_task` vía `learning_phase`→`learning_plan`); el estudiante puede completar una `learning_task` propia con `source = SELF_DIRECTED` pero recibe 0 filas afectadas al intentarlo sobre una con `source = ACADEMY`; el estudiante no puede escribir en `learning_goal` (permiso denegado); `dashboard_service_role` puede leer y escribir en las 6 tablas nuevas y en las 4 preexistentes.

---

## 9. Problemas encontrados y corregidos

1. **`completed_at` ausente en 13.4 para `LearningObjective` y `LearningPhase`.** La resolución 18.21 declara el invariante `completed_at`/`status` "aplicable a las 4 entidades", pero la ficha original de 13.4 solo listaba `completed_at` para `LearningGoal` y `LearningTask`. Detectado al diseñar el schema (el CHECK constraint no tenía columna que referenciar en 2 de 4 tablas). **Corregido:** se añadió `completed_at` a ambas fichas en el documento consolidado y se implementó la columna + el CHECK correspondiente en las 4 tablas.

2. **`dashboard_service_role` sin ningún `GRANT` de escritura sobre `learning_plan`/`daily_plan`/`weekly_plan`/`learning_progress`.** La migración RLS original del Dashboard (`202607170900`) solo otorgó escritura sobre `"user"` y `"student_dashboard"`. Sin corrección, ningún servicio futuro (creación de plan, reprogramación, recálculo de progreso) podría escribir en esas 4 tablas pese a `BYPASSRLS`. **Corregido:** `GRANT` añadido en `202607171400_my_plan_rls_policies`.

3. **El `GRANT` de la corrección anterior omitía `SELECT`.** Detectado durante la verificación empírica con PGlite: un `UPDATE ... WHERE ...` (con o sin `RETURNING`) requiere también `SELECT` sobre la tabla — sin él, Postgres devuelve `permission denied` incluso con `BYPASSRLS` activo, porque el `GRANT` de tabla es independiente de las políticas de fila. **Corregido:** se amplió el `GRANT` a `SELECT, INSERT, UPDATE` en `migration.sql` y el `REVOKE` equivalente en `rollback.sql`, y se re-verificó con éxito.

Los 3 problemas se corrigieron dentro de este mismo sprint, antes de cerrar la auditoría, sin dejar deuda técnica pendiente.

---

## 10. Riesgos pendientes

- **Mecanismo de entrega de los 5 eventos de dominio (18.20.11) no implementado.** `ARCHITECTURE.md` documenta explícitamente que el "Motor de Orquestación" aún no existe. Esto es correcto y esperado: está fuera de alcance de este sprint (exclusivamente persistencia) y corresponde a un sprint de servicios/dominio posterior — no bloquea el uso del modelo de datos en sí.
- **Migraciones no ejecutadas con `prisma migrate deploy` contra Postgres real en este entorno.** El sandbox de esta sesión bloquea la descarga de los binarios del motor de Prisma (403 en `binaries.prisma.sh`). Se verificó estructuralmente `schema.prisma` (llaves/paréntesis balanceados, 105 `map:` sin duplicados) y funcionalmente el SQL resultante con PGlite (Postgres 17 real vía WASM) sobre la cadena completa de migraciones del proyecto — pero la ejecución de `npx prisma migrate deploy`/`npx prisma generate` contra el Postgres real de Supabase queda pendiente de un entorno con acceso de red a Prisma.
- **Datos de prueba de esta verificación no persisten:** la verificación PGlite se ejecutó en una base de datos efímera en memoria; no hay riesgo de contaminación del entorno real, pero tampoco constituye una prueba de carga ni de migración sobre datos de producción (no aplica: el proyecto aún no tiene datos de producción).

Ninguno de estos riesgos es un vacío de especificación ni bloquea a Sprint 3.3.2.

---

## 11. Veredicto técnico

**🟢 MODELO DE DATOS IMPLEMENTADO Y APROBADO**

Las 6 entidades, los 6 ENUM, las 7 relaciones, los 32 objetos regulados por 13.13 (100% conformes), los 13 índices justificados, las 2 migraciones (reversibles, verificadas) y las políticas RLS (verificadas con aislamiento correcto y restricción de `source` a nivel de fila) están completos, implementados y verificados empíricamente. Los 3 problemas detectados durante la propia auditoría se corrigieron dentro del sprint. El modelo de datos puede usarse inmediatamente por Sprint 3.3.2 (dominio, servicios, repositorios y APIs de Mi Plan) sin necesidad de ninguna decisión técnica nueva.
