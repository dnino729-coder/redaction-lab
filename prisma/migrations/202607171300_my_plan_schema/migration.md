# Migración `202607171300_my_plan_schema`

**Módulo funcional:** Mi Plan (13.14: una migración, un módulo funcional).

**Origen:** Sprint 3.3.1 (Modelo de Datos), sobre `docs/modules/mi-plan.md` (Arquitectura Definitiva, Fase 3.2) y las resoluciones 18.20/18.21. Único alcance: las 6 entidades de 13.4 que aún no existían.

**Depende de:** `202607161000_dashboard_read_schema` (crea `learning_plan`, referenciada por FK desde `learning_goal`, `learning_phase` y `study_schedule`) y, transitivamente, `202607171200_constraint_naming_standardization` (nomenclatura ya vigente para las tablas previas).

## Qué crea

- 6 tipos ENUM: `LearningGoalStatus`, `LearningObjectiveStatus`, `LearningPhaseStatus`, `LearningTaskStatus`, `LearningTaskDifficulty`, `LearningTaskSource`.
- 6 tablas: `learning_goal`, `learning_objective`, `learning_phase`, `learning_task`, `study_schedule`, `study_session`.
- 6 `PRIMARY KEY`, 7 `FOREIGN KEY`, 1 `UNIQUE` (`study_schedule.learning_plan_id`, relación 1:1), 4 `CHECK` (invariante `completed_at`/`status`, una por cada entidad con ciclo de vida propio), 13 `INDEX` — todos con la nomenclatura `pk_`/`fk_`/`uq_`/`ck_`/`idx_` desde el origen (13.13/18.20.12).

## Qué NO crea (deliberado)

Ninguna columna, constraint ni índice nuevo sobre `learning_plan`, `daily_plan`, `weekly_plan` o `learning_progress` (ya existentes desde `202607161000`) — permanecen exactamente como estaban. Ninguna política de RLS ni GRANT (ver migración `202607171400_my_plan_rls_policies`, dedicada).

## Corrección de consistencia documental aplicada en esta fase

13.4 (documento consolidado) no listaba originalmente `completed_at` en las fichas de `LearningObjective` ni `LearningPhase`, pese a que la resolución 18.21 declara el invariante `completed_at`/`status` como aplicable a las 4 entidades con ciclo de vida (`LearningGoal`, `LearningObjective`, `LearningPhase`, `LearningTask`). Detectado durante este sprint y corregido: se añadió `completed_at (NULL)` a ambas fichas en el documento consolidado, y ambas columnas están presentes en esta migración — sin esta corrección, el invariante de 18.21 habría sido inaplicable en 2 de las 4 tablas.

## Índices — justificación

| Índice | Soporta |
|---|---|
| `idx_learning_goal_learning_plan_id` / `..._status` | Bloque "Objetivos y metas" de Mi Plan (listar metas de un plan, filtradas por estado activo) |
| `idx_learning_objective_learning_goal_id` / `..._status` | Sub-lista de objetivos de una meta; cálculo automático de `LearningGoal.status` |
| `idx_learning_phase_learning_plan_id` / `..._status` | Bloque "Fases y tareas"; calendario/timeline del plan |
| `idx_learning_task_learning_phase_id` / `..._status` | Listado de tareas de una fase; cálculo automático de `LearningPhase.status` |
| `idx_learning_task_source` | Learning Planner / consumidor del evento `EXTERNAL_ACTIVITY_COMPLETED` (filtrar tareas por ecosistema de origen) |
| `idx_learning_task_due_date` | Vista de calendario ("próximas tareas"), Dashboard/Mi Plan |
| `idx_study_session_student_id` / `..._learning_task_id` | RLS (aislamiento por estudiante) y navegación tarea→sesiones |
| `idx_study_session_student_id_started_at` | Job de reorganización automática por inactividad (18.21: umbral de 3 días sin `StudySession` completada) |

No se crea índice adicional en `study_schedule.learning_plan_id`: la restricción `uq_study_schedule_learning_plan_id` ya provee un índice único para ese lookup — un índice adicional sería redundante.

## Cómo aplicar

```bash
npx prisma migrate deploy
```

Se aplica después de `202607161000` (y de `202607171200`, si el entorno respeta el orden cronológico de carpetas) y antes de `202607171400_my_plan_rls_policies`.

## Reversibilidad

`rollback.sql` elimina las 6 tablas y los 6 tipos en orden inverso de dependencia. Operación limpia: ninguna tabla existente antes de esta migración se ve afectada, no hay pérdida de datos fuera del propio módulo Mi Plan.
