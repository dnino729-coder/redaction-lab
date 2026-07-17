# Auditoría de nomenclatura de constraints — cierre previo a Baseline 1.0

**Rol:** Database Architect / PostgreSQL Expert. **Fecha:** 2026-07-17.
**Alcance:** cumplimiento de la sección 13.13 del documento consolidado
(`pk_`/`fk_`/`uq_`/`idx_`/`ck_`) sobre los objetos físicos creados por
`202607161000_dashboard_read_schema` y `202607170900_dashboard_rls_policies`.
No se modificó estructura, datos, lógica de negocio, RLS, roles, GRANT,
autenticación ni Clerk/Supabase.

## 1. Estado detectado antes de corregir

| Tipo | Convención 13.13 | Convención real (antes) | Cumplía |
|---|---|---|---|
| Primary Key | `pk_<tabla>` | `<tabla>_pkey` (default Postgres) | No |
| Foreign Key | `fk_<tabla>_<columna>` | `<tabla>_<columna>_fkey` (default Prisma) | No |
| Unique | `uq_<tabla>_<columnas>` | `<tabla>_<columna>_key` (default Prisma) | No |
| Index | `idx_<tabla>_<columnas>` | `<tabla>_<columnas>_idx` (default Prisma) | No |
| Check | `ck_<tabla>_<regla>` | `ck_<tabla>_<regla>` (escrito a mano) | Sí |

La desviación estaba señalada explícitamente como deuda técnica en
`prisma/schema.prisma` y en `prisma/migrations/202607161000.../migration.md`
desde su creación — no era un hallazgo nuevo, era una corrección prevista y
documentada desde el inicio.

## 2. Corrección aplicada

- **Migración dedicada:** `prisma/migrations/202607171200_constraint_naming_standardization/migration.sql` — únicamente `ALTER TABLE ... RENAME CONSTRAINT` y `ALTER INDEX ... RENAME TO`. Sin `CREATE`, `DROP`, `ALTER COLUMN` ni `UPDATE`/`INSERT`/`DELETE`.
- **`rollback.sql`** en el mismo directorio, con el sentido inverso completo.
- **`schema.prisma`** actualizado con `map: "..."` explícito en cada `@id`, `@unique`, `@relation` y `@@index`, para que `prisma migrate dev` genere automáticamente la convención correcta en toda migración futura, sin depender de disciplina manual en cada PR.

## 3. Lista completa de objetos renombrados (78)

### Primary Keys (22)

| Tabla | Antes | Después |
|---|---|---|
| user | user_pkey | pk_user |
| student_profile | student_profile_pkey | pk_student_profile |
| learning_plan | learning_plan_pkey | pk_learning_plan |
| daily_plan | daily_plan_pkey | pk_daily_plan |
| weekly_plan | weekly_plan_pkey | pk_weekly_plan |
| learning_progress | learning_progress_pkey | pk_learning_progress |
| writing_submission | writing_submission_pkey | pk_writing_submission |
| writing_draft | writing_draft_pkey | pk_writing_draft |
| exam_attempt | exam_attempt_pkey | pk_exam_attempt |
| evaluation_result | evaluation_result_pkey | pk_evaluation_result |
| coach_recommendation | coach_recommendation_pkey | pk_coach_recommendation |
| coach_context | coach_context_pkey | pk_coach_context |
| competency | competency_pkey | pk_competency |
| student_competency | student_competency_pkey | pk_student_competency |
| competency_progress | competency_progress_pkey | pk_competency_progress |
| learning_metric | learning_metric_pkey | pk_learning_metric |
| performance_metric | performance_metric_pkey | pk_performance_metric |
| learning_analytics | learning_analytics_pkey | pk_learning_analytics |
| student_dashboard | student_dashboard_pkey | pk_student_dashboard |
| streak | streak_pkey | pk_streak |
| student_level | student_level_pkey | pk_student_level |
| xp_transaction | xp_transaction_pkey | pk_xp_transaction |

### Unique Constraints (11)

| Tabla | Antes | Después |
|---|---|---|
| user | user_email_key | uq_user_email |
| user | user_clerk_user_id_key | uq_user_clerk_user_id |
| student_profile | student_profile_user_id_key | uq_student_profile_user_id |
| learning_progress | learning_progress_learning_plan_id_key | uq_learning_progress_learning_plan_id |
| evaluation_result | evaluation_result_attempt_id_key | uq_evaluation_result_attempt_id |
| coach_context | coach_context_student_id_key | uq_coach_context_student_id |
| competency | competency_code_key | uq_competency_code |
| learning_analytics | learning_analytics_student_id_key | uq_learning_analytics_student_id |
| student_dashboard | student_dashboard_student_id_key | uq_student_dashboard_student_id |
| streak | streak_student_id_key | uq_streak_student_id |
| student_level | student_level_student_id_key | uq_student_level_student_id |

### Foreign Keys (23)

| Tabla | Antes | Después |
|---|---|---|
| student_profile | student_profile_user_id_fkey | fk_student_profile_user_id |
| learning_plan | learning_plan_student_id_fkey | fk_learning_plan_student_id |
| daily_plan | daily_plan_learning_plan_id_fkey | fk_daily_plan_learning_plan_id |
| weekly_plan | weekly_plan_learning_plan_id_fkey | fk_weekly_plan_learning_plan_id |
| learning_progress | learning_progress_learning_plan_id_fkey | fk_learning_progress_learning_plan_id |
| writing_submission | writing_submission_student_id_fkey | fk_writing_submission_student_id |
| writing_draft | writing_draft_submission_id_fkey | fk_writing_draft_submission_id |
| exam_attempt | exam_attempt_student_id_fkey | fk_exam_attempt_student_id |
| evaluation_result | evaluation_result_attempt_id_fkey | fk_evaluation_result_attempt_id |
| coach_recommendation | coach_recommendation_student_id_fkey | fk_coach_recommendation_student_id |
| coach_context | coach_context_student_id_fkey | fk_coach_context_student_id |
| coach_context | coach_context_current_plan_id_fkey | fk_coach_context_current_plan_id |
| coach_context | coach_context_last_submission_id_fkey | fk_coach_context_last_submission_id |
| student_competency | student_competency_student_id_fkey | fk_student_competency_student_id |
| student_competency | student_competency_competency_id_fkey | fk_student_competency_competency_id |
| competency_progress | competency_progress_student_competency_id_fkey | fk_competency_progress_student_competency_id |
| learning_metric | learning_metric_student_id_fkey | fk_learning_metric_student_id |
| performance_metric | performance_metric_student_id_fkey | fk_performance_metric_student_id |
| learning_analytics | learning_analytics_student_id_fkey | fk_learning_analytics_student_id |
| student_dashboard | student_dashboard_student_id_fkey | fk_student_dashboard_student_id |
| streak | streak_student_id_fkey | fk_streak_student_id |
| student_level | student_level_student_id_fkey | fk_student_level_student_id |
| xp_transaction | xp_transaction_student_id_fkey | fk_xp_transaction_student_id |

### Indexes (22)

| Tabla | Antes | Después |
|---|---|---|
| user | user_status_idx | idx_user_status |
| learning_plan | learning_plan_student_id_idx | idx_learning_plan_student_id |
| learning_plan | learning_plan_student_id_status_idx | idx_learning_plan_student_id_status |
| daily_plan | daily_plan_learning_plan_id_idx | idx_daily_plan_learning_plan_id |
| daily_plan | daily_plan_learning_plan_id_plan_date_idx | idx_daily_plan_learning_plan_id_plan_date |
| weekly_plan | weekly_plan_learning_plan_id_idx | idx_weekly_plan_learning_plan_id |
| writing_submission | writing_submission_student_id_idx | idx_writing_submission_student_id |
| writing_submission | writing_submission_student_id_status_idx | idx_writing_submission_student_id_status |
| writing_draft | writing_draft_submission_id_idx | idx_writing_draft_submission_id |
| exam_attempt | exam_attempt_student_id_idx | idx_exam_attempt_student_id |
| exam_attempt | exam_attempt_student_id_status_idx | idx_exam_attempt_student_id_status |
| coach_recommendation | coach_recommendation_student_id_idx | idx_coach_recommendation_student_id |
| coach_recommendation | coach_recommendation_student_id_completed_created_at_idx | idx_coach_recommendation_student_id_completed_created_at |
| student_competency | student_competency_student_id_idx | idx_student_competency_student_id |
| student_competency | student_competency_student_id_competency_id_idx | idx_student_competency_student_id_competency_id |
| competency_progress | competency_progress_student_competency_id_idx | idx_competency_progress_student_competency_id |
| learning_metric | learning_metric_student_id_idx | idx_learning_metric_student_id |
| learning_metric | learning_metric_student_id_calculated_at_idx | idx_learning_metric_student_id_calculated_at |
| performance_metric | performance_metric_student_id_idx | idx_performance_metric_student_id |
| performance_metric | performance_metric_student_id_evaluated_at_idx | idx_performance_metric_student_id_evaluated_at |
| xp_transaction | xp_transaction_student_id_idx | idx_xp_transaction_student_id |
| xp_transaction | xp_transaction_student_id_created_at_idx | idx_xp_transaction_student_id_created_at |

### Check Constraints (11) — sin cambios, ya conformes

`ck_daily_plan_completion_percentage`, `ck_weekly_plan_completion_percentage`,
`ck_learning_progress_completion_percentage`, `ck_exam_attempt_total_score`,
`ck_evaluation_result_percentage`, `ck_student_competency_mastery_percentage`,
`ck_performance_metric_success_rate`, `ck_learning_analytics_indexes`,
`ck_student_dashboard_total_xp`, `ck_streak_counts`, `ck_student_level_number`.

## 4. Verificación empírica ejecutada (PGlite — Postgres real, no simulado)

Se aplicó, sobre una instancia real de Postgres (WASM), la secuencia completa
`202607161000` → `202607170900` → `202607171200` y se introspeccionó
`pg_constraint`/`pg_index` directamente:

- **Inventario total introspeccionado:** 230 objetos (208 filas de `pg_constraint` + 22 índices no-constraint de `pg_index`). De esas 208 filas de `pg_constraint`, 67 corresponden a PK/FK/UNIQUE/CHECK (22+23+11+11) y 141 son entradas `NOT NULL` autogeneradas por PostgreSQL 17 (ver nota más abajo, fuera de alcance de 13.13). Sumando los 22 índices, el total de objetos regulados por 13.13 es 89.
- **Antes del rename:** de esos 89 objetos regulados, solo los 11 `CHECK` eran conformes — 78 de 89 no conformes.
- **Después del rename:** conteo por tipo `{ PK: 22, FK: 23, UNIQUE: 11, CHECK: 11, INDEX: 22 }` — **89 de 89 conformes (100%)** dentro de las cinco categorías que la sección 13.13 define. El resto detectado como "no conforme" por la consulta automática (141 filas) corresponde íntegramente a `NOT NULL`, categoría no contemplada por 13.13 — ver nota.
- **RLS intacta:** 23 policies, 22 tablas con `relrowsecurity = true`, roles `dashboard_app_role`/`dashboard_service_role` presentes tras el rename.
- **Aislamiento funcional confirmado:** con `SET LOCAL ROLE dashboard_app_role` + `app.current_student_id` fijado, una consulta sobre `xp_transaction` tras el rename sigue devolviendo únicamente la fila del estudiante correcto — el renombrado de constraints no altera en nada la evaluación de políticas (que referencian tabla/columna, nunca nombre de constraint).
- **Rollback exacto:** aplicar `rollback.sql` tras el rename devuelve el juego completo de 230 nombres (constraints + índices) exactamente al estado original — 0 faltantes, 0 sobrantes.
- **Consistencia `schema.prisma` ↔ migración:** los 78 valores `map:` del schema y los 78 nombres destino (`TO "..."`) de `migration.sql` son un conjunto idéntico (diff vacío, 0 duplicados) — garantiza que una futura ejecución de `prisma migrate dev` no generará ningún diff de nomenclatura contra el estado ya aplicado.

**Hallazgo adicional, fuera de alcance de 13.13 (no accionado):** Postgres 17
registra cada columna `NOT NULL` como una entrada propia en `pg_constraint`
(nombre autogenerado `<tabla>_<columna>_not_null`, no configurable desde
Prisma). La sección 13.13 define exactamente cinco categorías
(PK/FK/UNIQUE/INDEX/CHECK) y no menciona `NOT NULL`; se documenta aquí para
que la auditoría automática no se lea como "incumplimiento silencioso" —
no requiere corrección salvo decisión explícita de ampliar 13.13.

## 5. Compatibilidad con migraciones existentes

`RENAME CONSTRAINT` / `RENAME INDEX` son operaciones de catálogo puro en
PostgreSQL: no reescriben la tabla, no afectan filas, no requieren locks
distintos de un `ACCESS EXCLUSIVE` brevísimo sobre el catálogo. Las políticas
de RLS y los `GRANT` de `202607170900` referencian nombres de tabla y
columna, nunca nombres de constraint (confirmado por lectura completa de ese
archivo) — la migración de renombrado es válida independientemente del orden
en que se apliquen las anteriores, siempre que se ejecute después de ambas.

## 6. Riesgo residual documentado

El `RENAME CONSTRAINT "user_pkey" TO ...` (y equivalentes) asume que
Postgres asignó el nombre por defecto exacto (`<tabla>_pkey`) a cada
`PRIMARY KEY` declarada inline sin `CONSTRAINT` explícito — cierto en un
despliegue estándar a partir de `202607161000` tal como está escrito. Si un
entorno real tiene un nombre distinto (por ejemplo, por haberse creado con
otra herramienta), el `RENAME` correspondiente falla de forma explícita y
segura (error SQL, no corrupción silenciosa) — verificar con `\d+ <tabla>` o
`SELECT conname FROM pg_constraint` antes de aplicar en Staging/Production,
tal como ya se recomendaba para las migraciones anteriores de este proyecto.

## 7. Veredicto

Arquitectura de nomenclatura de base de datos alineada al 100% con la
sección 13.13 del documento consolidado, dentro del alcance que esa sección
define. No quedan bloqueantes de nomenclatura para congelar la Baseline 1.0.
