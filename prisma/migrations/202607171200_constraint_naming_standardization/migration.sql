-- Migración: 202607171200_constraint_naming_standardization
-- Alcance: ÚNICA Y EXCLUSIVAMENTE renombrado de constraints físicos e
-- índices para cumplir la sección 13.13 del documento consolidado
-- (convención obligatoria: pk_/fk_/uq_/idx_/ck_). No crea, elimina ni
-- modifica ninguna tabla, columna, tipo, dato, política de RLS, rol ni
-- privilegio. Ver docs/database/naming-convention-audit-2026-07-17.md
-- para el detalle de la decisión y la auditoría de cumplimiento.
--
-- Motivo y momento: auditoría de nomenclatura (Database Architect / Cierre
-- de Baseline 1.0) detectó que las migraciones 202607161000 y 202607170900
-- crearon PK/FK/UNIQUE/INDEX con la convención por defecto de Prisma
-- (`<tabla>_pkey`, `<tabla>_<columna>_fkey`, `<tabla>_<columna>_key`,
-- `<tabla>_<columnas>_idx`) en vez de los prefijos de 13.13 — desviación
-- documentada explícitamente como deuda técnica en el propio
-- prisma/schema.prisma (comentario junto al bloque MÓDULO DASHBOARD). Los
-- CHECK constraints ya cumplían (`ck_<tabla>_<regla>`), porque se
-- escribieron a mano desde el inicio; no se tocan aquí.
--
-- Se corrige ahora, antes de congelar la Baseline 1.0, porque 13.13 exige
-- "no modificar la nomenclatura una vez publicada una migración": esta es
-- la única ventana en que corregir el estado inicial no-conforme no
-- infringe esa regla, ya que a partir de esta migración la convención
-- queda fijada y no debe volver a cambiar.
--
-- Seguridad de la operación: RENAME CONSTRAINT / RENAME INDEX son
-- operaciones de catálogo puro en PostgreSQL (no reescriben la tabla, no
-- adquieren locks más fuertes que ACCESS EXCLUSIVE brevísimo sobre el
-- catálogo, no afectan filas ni datos). Las políticas de RLS
-- (202607170900) referencian nombres de TABLA y COLUMNA, nunca nombres de
-- constraint — confirmado por lectura completa de ese archivo — por lo
-- tanto esta migración no puede romper ninguna política ni ningún GRANT.
--
-- Generada a mano por el mismo motivo que las migraciones anteriores: sin
-- acceso de red a los binarios de motor de Prisma en este entorno. Antes de
-- aplicar en un entorno real, verificar los nombres actuales con
-- `\d+ <tabla>` (psql) o `SELECT conname FROM pg_constraint ...` — el
-- renombrado asume que Postgres asignó el nombre por defecto exacto que
-- Prisma habría generado (`<tabla>_pkey` para cada PRIMARY KEY declarada
-- inline sin CONSTRAINT explícito). Si algún entorno tiene un nombre
-- distinto por haberse creado de otra forma, el RENAME correspondiente
-- fallará de forma explícita y segura (error, no corrupción silenciosa) —
-- ver rollback.sql para el sentido inverso completo.

-- ============================== user ======================================
ALTER TABLE "user" RENAME CONSTRAINT "user_pkey" TO "pk_user";
ALTER TABLE "user" RENAME CONSTRAINT "user_email_key" TO "uq_user_email";
ALTER TABLE "user" RENAME CONSTRAINT "user_clerk_user_id_key" TO "uq_user_clerk_user_id";
ALTER INDEX "user_status_idx" RENAME TO "idx_user_status";

-- ========================= student_profile ================================
ALTER TABLE "student_profile" RENAME CONSTRAINT "student_profile_pkey" TO "pk_student_profile";
ALTER TABLE "student_profile" RENAME CONSTRAINT "student_profile_user_id_key" TO "uq_student_profile_user_id";
ALTER TABLE "student_profile" RENAME CONSTRAINT "student_profile_user_id_fkey" TO "fk_student_profile_user_id";

-- =========================== learning_plan ================================
ALTER TABLE "learning_plan" RENAME CONSTRAINT "learning_plan_pkey" TO "pk_learning_plan";
ALTER TABLE "learning_plan" RENAME CONSTRAINT "learning_plan_student_id_fkey" TO "fk_learning_plan_student_id";
ALTER INDEX "learning_plan_student_id_idx" RENAME TO "idx_learning_plan_student_id";
ALTER INDEX "learning_plan_student_id_status_idx" RENAME TO "idx_learning_plan_student_id_status";

-- ============================ daily_plan ==================================
ALTER TABLE "daily_plan" RENAME CONSTRAINT "daily_plan_pkey" TO "pk_daily_plan";
ALTER TABLE "daily_plan" RENAME CONSTRAINT "daily_plan_learning_plan_id_fkey" TO "fk_daily_plan_learning_plan_id";
-- CHECK "ck_daily_plan_completion_percentage" ya cumple 13.13 — sin cambios.
ALTER INDEX "daily_plan_learning_plan_id_idx" RENAME TO "idx_daily_plan_learning_plan_id";
ALTER INDEX "daily_plan_learning_plan_id_plan_date_idx" RENAME TO "idx_daily_plan_learning_plan_id_plan_date";

-- =========================== weekly_plan ==================================
ALTER TABLE "weekly_plan" RENAME CONSTRAINT "weekly_plan_pkey" TO "pk_weekly_plan";
ALTER TABLE "weekly_plan" RENAME CONSTRAINT "weekly_plan_learning_plan_id_fkey" TO "fk_weekly_plan_learning_plan_id";
-- CHECK "ck_weekly_plan_completion_percentage" ya cumple 13.13 — sin cambios.
ALTER INDEX "weekly_plan_learning_plan_id_idx" RENAME TO "idx_weekly_plan_learning_plan_id";

-- ========================= learning_progress ==============================
ALTER TABLE "learning_progress" RENAME CONSTRAINT "learning_progress_pkey" TO "pk_learning_progress";
ALTER TABLE "learning_progress" RENAME CONSTRAINT "learning_progress_learning_plan_id_key" TO "uq_learning_progress_learning_plan_id";
ALTER TABLE "learning_progress" RENAME CONSTRAINT "learning_progress_learning_plan_id_fkey" TO "fk_learning_progress_learning_plan_id";
-- CHECK "ck_learning_progress_completion_percentage" ya cumple 13.13 — sin cambios.

-- ========================= writing_submission ==============================
ALTER TABLE "writing_submission" RENAME CONSTRAINT "writing_submission_pkey" TO "pk_writing_submission";
ALTER TABLE "writing_submission" RENAME CONSTRAINT "writing_submission_student_id_fkey" TO "fk_writing_submission_student_id";
ALTER INDEX "writing_submission_student_id_idx" RENAME TO "idx_writing_submission_student_id";
ALTER INDEX "writing_submission_student_id_status_idx" RENAME TO "idx_writing_submission_student_id_status";

-- ============================ writing_draft ================================
ALTER TABLE "writing_draft" RENAME CONSTRAINT "writing_draft_pkey" TO "pk_writing_draft";
ALTER TABLE "writing_draft" RENAME CONSTRAINT "writing_draft_submission_id_fkey" TO "fk_writing_draft_submission_id";
ALTER INDEX "writing_draft_submission_id_idx" RENAME TO "idx_writing_draft_submission_id";

-- ============================ exam_attempt =================================
ALTER TABLE "exam_attempt" RENAME CONSTRAINT "exam_attempt_pkey" TO "pk_exam_attempt";
ALTER TABLE "exam_attempt" RENAME CONSTRAINT "exam_attempt_student_id_fkey" TO "fk_exam_attempt_student_id";
-- CHECK "ck_exam_attempt_total_score" ya cumple 13.13 — sin cambios.
ALTER INDEX "exam_attempt_student_id_idx" RENAME TO "idx_exam_attempt_student_id";
ALTER INDEX "exam_attempt_student_id_status_idx" RENAME TO "idx_exam_attempt_student_id_status";

-- ========================== evaluation_result ==============================
ALTER TABLE "evaluation_result" RENAME CONSTRAINT "evaluation_result_pkey" TO "pk_evaluation_result";
ALTER TABLE "evaluation_result" RENAME CONSTRAINT "evaluation_result_attempt_id_key" TO "uq_evaluation_result_attempt_id";
ALTER TABLE "evaluation_result" RENAME CONSTRAINT "evaluation_result_attempt_id_fkey" TO "fk_evaluation_result_attempt_id";
-- CHECK "ck_evaluation_result_percentage" ya cumple 13.13 — sin cambios.

-- ========================= coach_recommendation =============================
ALTER TABLE "coach_recommendation" RENAME CONSTRAINT "coach_recommendation_pkey" TO "pk_coach_recommendation";
ALTER TABLE "coach_recommendation" RENAME CONSTRAINT "coach_recommendation_student_id_fkey" TO "fk_coach_recommendation_student_id";
ALTER INDEX "coach_recommendation_student_id_idx" RENAME TO "idx_coach_recommendation_student_id";
ALTER INDEX "coach_recommendation_student_id_completed_created_at_idx" RENAME TO "idx_coach_recommendation_student_id_completed_created_at";

-- ============================ coach_context ================================
ALTER TABLE "coach_context" RENAME CONSTRAINT "coach_context_pkey" TO "pk_coach_context";
ALTER TABLE "coach_context" RENAME CONSTRAINT "coach_context_student_id_key" TO "uq_coach_context_student_id";
ALTER TABLE "coach_context" RENAME CONSTRAINT "coach_context_student_id_fkey" TO "fk_coach_context_student_id";
ALTER TABLE "coach_context" RENAME CONSTRAINT "coach_context_current_plan_id_fkey" TO "fk_coach_context_current_plan_id";
ALTER TABLE "coach_context" RENAME CONSTRAINT "coach_context_last_submission_id_fkey" TO "fk_coach_context_last_submission_id";

-- ============================== competency ==================================
ALTER TABLE "competency" RENAME CONSTRAINT "competency_pkey" TO "pk_competency";
ALTER TABLE "competency" RENAME CONSTRAINT "competency_code_key" TO "uq_competency_code";

-- ========================== student_competency ==============================
ALTER TABLE "student_competency" RENAME CONSTRAINT "student_competency_pkey" TO "pk_student_competency";
ALTER TABLE "student_competency" RENAME CONSTRAINT "student_competency_student_id_fkey" TO "fk_student_competency_student_id";
ALTER TABLE "student_competency" RENAME CONSTRAINT "student_competency_competency_id_fkey" TO "fk_student_competency_competency_id";
-- CHECK "ck_student_competency_mastery_percentage" ya cumple 13.13 — sin cambios.
ALTER INDEX "student_competency_student_id_idx" RENAME TO "idx_student_competency_student_id";
ALTER INDEX "student_competency_student_id_competency_id_idx" RENAME TO "idx_student_competency_student_id_competency_id";

-- ========================= competency_progress ==============================
ALTER TABLE "competency_progress" RENAME CONSTRAINT "competency_progress_pkey" TO "pk_competency_progress";
ALTER TABLE "competency_progress" RENAME CONSTRAINT "competency_progress_student_competency_id_fkey" TO "fk_competency_progress_student_competency_id";
ALTER INDEX "competency_progress_student_competency_id_idx" RENAME TO "idx_competency_progress_student_competency_id";

-- =========================== learning_metric ================================
ALTER TABLE "learning_metric" RENAME CONSTRAINT "learning_metric_pkey" TO "pk_learning_metric";
ALTER TABLE "learning_metric" RENAME CONSTRAINT "learning_metric_student_id_fkey" TO "fk_learning_metric_student_id";
ALTER INDEX "learning_metric_student_id_idx" RENAME TO "idx_learning_metric_student_id";
ALTER INDEX "learning_metric_student_id_calculated_at_idx" RENAME TO "idx_learning_metric_student_id_calculated_at";

-- ========================== performance_metric ===============================
ALTER TABLE "performance_metric" RENAME CONSTRAINT "performance_metric_pkey" TO "pk_performance_metric";
ALTER TABLE "performance_metric" RENAME CONSTRAINT "performance_metric_student_id_fkey" TO "fk_performance_metric_student_id";
-- CHECK "ck_performance_metric_success_rate" ya cumple 13.13 — sin cambios.
ALTER INDEX "performance_metric_student_id_idx" RENAME TO "idx_performance_metric_student_id";
ALTER INDEX "performance_metric_student_id_evaluated_at_idx" RENAME TO "idx_performance_metric_student_id_evaluated_at";

-- ========================== learning_analytics ===============================
ALTER TABLE "learning_analytics" RENAME CONSTRAINT "learning_analytics_pkey" TO "pk_learning_analytics";
ALTER TABLE "learning_analytics" RENAME CONSTRAINT "learning_analytics_student_id_key" TO "uq_learning_analytics_student_id";
ALTER TABLE "learning_analytics" RENAME CONSTRAINT "learning_analytics_student_id_fkey" TO "fk_learning_analytics_student_id";
-- CHECK "ck_learning_analytics_indexes" ya cumple 13.13 — sin cambios.

-- =========================== student_dashboard ================================
ALTER TABLE "student_dashboard" RENAME CONSTRAINT "student_dashboard_pkey" TO "pk_student_dashboard";
ALTER TABLE "student_dashboard" RENAME CONSTRAINT "student_dashboard_student_id_key" TO "uq_student_dashboard_student_id";
ALTER TABLE "student_dashboard" RENAME CONSTRAINT "student_dashboard_student_id_fkey" TO "fk_student_dashboard_student_id";
-- CHECK "ck_student_dashboard_total_xp" ya cumple 13.13 — sin cambios.

-- ================================ streak ========================================
ALTER TABLE "streak" RENAME CONSTRAINT "streak_pkey" TO "pk_streak";
ALTER TABLE "streak" RENAME CONSTRAINT "streak_student_id_key" TO "uq_streak_student_id";
ALTER TABLE "streak" RENAME CONSTRAINT "streak_student_id_fkey" TO "fk_streak_student_id";
-- CHECK "ck_streak_counts" ya cumple 13.13 — sin cambios.

-- ============================= student_level ====================================
ALTER TABLE "student_level" RENAME CONSTRAINT "student_level_pkey" TO "pk_student_level";
ALTER TABLE "student_level" RENAME CONSTRAINT "student_level_student_id_key" TO "uq_student_level_student_id";
ALTER TABLE "student_level" RENAME CONSTRAINT "student_level_student_id_fkey" TO "fk_student_level_student_id";
-- CHECK "ck_student_level_number" ya cumple 13.13 — sin cambios.

-- ============================= xp_transaction ====================================
ALTER TABLE "xp_transaction" RENAME CONSTRAINT "xp_transaction_pkey" TO "pk_xp_transaction";
ALTER TABLE "xp_transaction" RENAME CONSTRAINT "xp_transaction_student_id_fkey" TO "fk_xp_transaction_student_id";
ALTER INDEX "xp_transaction_student_id_idx" RENAME TO "idx_xp_transaction_student_id";
ALTER INDEX "xp_transaction_student_id_created_at_idx" RENAME TO "idx_xp_transaction_student_id_created_at";

-- ============================================================================
-- Resumen: 22 PRIMARY KEY + 11 UNIQUE + 22 FOREIGN KEY + 22 INDEX renombrados
-- (77 objetos). 11 CHECK constraints ya conformes, sin cambios. Ningún DROP,
-- ningún CREATE de tabla/columna/dato. Ninguna política de RLS, rol ni GRANT
-- tocado.
-- ============================================================================
