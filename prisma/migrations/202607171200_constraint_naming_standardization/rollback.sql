-- Rollback de: 202607171200_constraint_naming_standardization
-- Revierte cada RENAME al nombre por defecto que Prisma/Postgres generó en
-- 202607161000, en el mismo orden inverso. Operación de catálogo puro,
-- reversible al 100%: no hay pérdida de datos ni de estructura posible.

-- ============================= xp_transaction ====================================
ALTER INDEX "idx_xp_transaction_student_id_created_at" RENAME TO "xp_transaction_student_id_created_at_idx";
ALTER INDEX "idx_xp_transaction_student_id" RENAME TO "xp_transaction_student_id_idx";
ALTER TABLE "xp_transaction" RENAME CONSTRAINT "fk_xp_transaction_student_id" TO "xp_transaction_student_id_fkey";
ALTER TABLE "xp_transaction" RENAME CONSTRAINT "pk_xp_transaction" TO "xp_transaction_pkey";

-- ============================= student_level ====================================
ALTER TABLE "student_level" RENAME CONSTRAINT "fk_student_level_student_id" TO "student_level_student_id_fkey";
ALTER TABLE "student_level" RENAME CONSTRAINT "uq_student_level_student_id" TO "student_level_student_id_key";
ALTER TABLE "student_level" RENAME CONSTRAINT "pk_student_level" TO "student_level_pkey";

-- ================================ streak ========================================
ALTER TABLE "streak" RENAME CONSTRAINT "fk_streak_student_id" TO "streak_student_id_fkey";
ALTER TABLE "streak" RENAME CONSTRAINT "uq_streak_student_id" TO "streak_student_id_key";
ALTER TABLE "streak" RENAME CONSTRAINT "pk_streak" TO "streak_pkey";

-- =========================== student_dashboard ================================
ALTER TABLE "student_dashboard" RENAME CONSTRAINT "fk_student_dashboard_student_id" TO "student_dashboard_student_id_fkey";
ALTER TABLE "student_dashboard" RENAME CONSTRAINT "uq_student_dashboard_student_id" TO "student_dashboard_student_id_key";
ALTER TABLE "student_dashboard" RENAME CONSTRAINT "pk_student_dashboard" TO "student_dashboard_pkey";

-- ========================== learning_analytics ===============================
ALTER TABLE "learning_analytics" RENAME CONSTRAINT "fk_learning_analytics_student_id" TO "learning_analytics_student_id_fkey";
ALTER TABLE "learning_analytics" RENAME CONSTRAINT "uq_learning_analytics_student_id" TO "learning_analytics_student_id_key";
ALTER TABLE "learning_analytics" RENAME CONSTRAINT "pk_learning_analytics" TO "learning_analytics_pkey";

-- ========================== performance_metric ===============================
ALTER INDEX "idx_performance_metric_student_id_evaluated_at" RENAME TO "performance_metric_student_id_evaluated_at_idx";
ALTER INDEX "idx_performance_metric_student_id" RENAME TO "performance_metric_student_id_idx";
ALTER TABLE "performance_metric" RENAME CONSTRAINT "fk_performance_metric_student_id" TO "performance_metric_student_id_fkey";
ALTER TABLE "performance_metric" RENAME CONSTRAINT "pk_performance_metric" TO "performance_metric_pkey";

-- =========================== learning_metric ================================
ALTER INDEX "idx_learning_metric_student_id_calculated_at" RENAME TO "learning_metric_student_id_calculated_at_idx";
ALTER INDEX "idx_learning_metric_student_id" RENAME TO "learning_metric_student_id_idx";
ALTER TABLE "learning_metric" RENAME CONSTRAINT "fk_learning_metric_student_id" TO "learning_metric_student_id_fkey";
ALTER TABLE "learning_metric" RENAME CONSTRAINT "pk_learning_metric" TO "learning_metric_pkey";

-- ========================= competency_progress ==============================
ALTER INDEX "idx_competency_progress_student_competency_id" RENAME TO "competency_progress_student_competency_id_idx";
ALTER TABLE "competency_progress" RENAME CONSTRAINT "fk_competency_progress_student_competency_id" TO "competency_progress_student_competency_id_fkey";
ALTER TABLE "competency_progress" RENAME CONSTRAINT "pk_competency_progress" TO "competency_progress_pkey";

-- ========================== student_competency ==============================
ALTER INDEX "idx_student_competency_student_id_competency_id" RENAME TO "student_competency_student_id_competency_id_idx";
ALTER INDEX "idx_student_competency_student_id" RENAME TO "student_competency_student_id_idx";
ALTER TABLE "student_competency" RENAME CONSTRAINT "fk_student_competency_competency_id" TO "student_competency_competency_id_fkey";
ALTER TABLE "student_competency" RENAME CONSTRAINT "fk_student_competency_student_id" TO "student_competency_student_id_fkey";
ALTER TABLE "student_competency" RENAME CONSTRAINT "pk_student_competency" TO "student_competency_pkey";

-- ============================== competency ==================================
ALTER TABLE "competency" RENAME CONSTRAINT "uq_competency_code" TO "competency_code_key";
ALTER TABLE "competency" RENAME CONSTRAINT "pk_competency" TO "competency_pkey";

-- ============================ coach_context ================================
ALTER TABLE "coach_context" RENAME CONSTRAINT "fk_coach_context_last_submission_id" TO "coach_context_last_submission_id_fkey";
ALTER TABLE "coach_context" RENAME CONSTRAINT "fk_coach_context_current_plan_id" TO "coach_context_current_plan_id_fkey";
ALTER TABLE "coach_context" RENAME CONSTRAINT "fk_coach_context_student_id" TO "coach_context_student_id_fkey";
ALTER TABLE "coach_context" RENAME CONSTRAINT "uq_coach_context_student_id" TO "coach_context_student_id_key";
ALTER TABLE "coach_context" RENAME CONSTRAINT "pk_coach_context" TO "coach_context_pkey";

-- ========================= coach_recommendation =============================
ALTER INDEX "idx_coach_recommendation_student_id_completed_created_at" RENAME TO "coach_recommendation_student_id_completed_created_at_idx";
ALTER INDEX "idx_coach_recommendation_student_id" RENAME TO "coach_recommendation_student_id_idx";
ALTER TABLE "coach_recommendation" RENAME CONSTRAINT "fk_coach_recommendation_student_id" TO "coach_recommendation_student_id_fkey";
ALTER TABLE "coach_recommendation" RENAME CONSTRAINT "pk_coach_recommendation" TO "coach_recommendation_pkey";

-- ========================== evaluation_result ==============================
ALTER TABLE "evaluation_result" RENAME CONSTRAINT "fk_evaluation_result_attempt_id" TO "evaluation_result_attempt_id_fkey";
ALTER TABLE "evaluation_result" RENAME CONSTRAINT "uq_evaluation_result_attempt_id" TO "evaluation_result_attempt_id_key";
ALTER TABLE "evaluation_result" RENAME CONSTRAINT "pk_evaluation_result" TO "evaluation_result_pkey";

-- ============================ exam_attempt =================================
ALTER INDEX "idx_exam_attempt_student_id_status" RENAME TO "exam_attempt_student_id_status_idx";
ALTER INDEX "idx_exam_attempt_student_id" RENAME TO "exam_attempt_student_id_idx";
ALTER TABLE "exam_attempt" RENAME CONSTRAINT "fk_exam_attempt_student_id" TO "exam_attempt_student_id_fkey";
ALTER TABLE "exam_attempt" RENAME CONSTRAINT "pk_exam_attempt" TO "exam_attempt_pkey";

-- ============================ writing_draft ================================
ALTER INDEX "idx_writing_draft_submission_id" RENAME TO "writing_draft_submission_id_idx";
ALTER TABLE "writing_draft" RENAME CONSTRAINT "fk_writing_draft_submission_id" TO "writing_draft_submission_id_fkey";
ALTER TABLE "writing_draft" RENAME CONSTRAINT "pk_writing_draft" TO "writing_draft_pkey";

-- ========================= writing_submission ==============================
ALTER INDEX "idx_writing_submission_student_id_status" RENAME TO "writing_submission_student_id_status_idx";
ALTER INDEX "idx_writing_submission_student_id" RENAME TO "writing_submission_student_id_idx";
ALTER TABLE "writing_submission" RENAME CONSTRAINT "fk_writing_submission_student_id" TO "writing_submission_student_id_fkey";
ALTER TABLE "writing_submission" RENAME CONSTRAINT "pk_writing_submission" TO "writing_submission_pkey";

-- ========================= learning_progress ==============================
ALTER TABLE "learning_progress" RENAME CONSTRAINT "fk_learning_progress_learning_plan_id" TO "learning_progress_learning_plan_id_fkey";
ALTER TABLE "learning_progress" RENAME CONSTRAINT "uq_learning_progress_learning_plan_id" TO "learning_progress_learning_plan_id_key";
ALTER TABLE "learning_progress" RENAME CONSTRAINT "pk_learning_progress" TO "learning_progress_pkey";

-- =========================== weekly_plan ==================================
ALTER INDEX "idx_weekly_plan_learning_plan_id" RENAME TO "weekly_plan_learning_plan_id_idx";
ALTER TABLE "weekly_plan" RENAME CONSTRAINT "fk_weekly_plan_learning_plan_id" TO "weekly_plan_learning_plan_id_fkey";
ALTER TABLE "weekly_plan" RENAME CONSTRAINT "pk_weekly_plan" TO "weekly_plan_pkey";

-- ============================ daily_plan ==================================
ALTER INDEX "idx_daily_plan_learning_plan_id_plan_date" RENAME TO "daily_plan_learning_plan_id_plan_date_idx";
ALTER INDEX "idx_daily_plan_learning_plan_id" RENAME TO "daily_plan_learning_plan_id_idx";
ALTER TABLE "daily_plan" RENAME CONSTRAINT "fk_daily_plan_learning_plan_id" TO "daily_plan_learning_plan_id_fkey";
ALTER TABLE "daily_plan" RENAME CONSTRAINT "pk_daily_plan" TO "daily_plan_pkey";

-- =========================== learning_plan ================================
ALTER INDEX "idx_learning_plan_student_id_status" RENAME TO "learning_plan_student_id_status_idx";
ALTER INDEX "idx_learning_plan_student_id" RENAME TO "learning_plan_student_id_idx";
ALTER TABLE "learning_plan" RENAME CONSTRAINT "fk_learning_plan_student_id" TO "learning_plan_student_id_fkey";
ALTER TABLE "learning_plan" RENAME CONSTRAINT "pk_learning_plan" TO "learning_plan_pkey";

-- ========================= student_profile ================================
ALTER TABLE "student_profile" RENAME CONSTRAINT "fk_student_profile_user_id" TO "student_profile_user_id_fkey";
ALTER TABLE "student_profile" RENAME CONSTRAINT "uq_student_profile_user_id" TO "student_profile_user_id_key";
ALTER TABLE "student_profile" RENAME CONSTRAINT "pk_student_profile" TO "student_profile_pkey";

-- ============================== user ======================================
ALTER INDEX "idx_user_status" RENAME TO "user_status_idx";
ALTER TABLE "user" RENAME CONSTRAINT "uq_user_clerk_user_id" TO "user_clerk_user_id_key";
ALTER TABLE "user" RENAME CONSTRAINT "uq_user_email" TO "user_email_key";
ALTER TABLE "user" RENAME CONSTRAINT "pk_user" TO "user_pkey";
