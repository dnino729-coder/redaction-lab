-- Migración: 202607161000_dashboard_read_schema
-- Módulo: Dashboard (implementación completa) — docs/modules/dashboard.md
-- Alcance: únicamente las tablas que el Dashboard lee (sección 10 del
-- diseño aprobado) más su propia entidad `student_dashboard`. Ver la nota
-- de alcance al inicio de prisma/schema.prisma para el detalle de qué
-- catálogos de otros módulos quedan deliberadamente fuera (Exam, Evaluator,
-- Competency, WritingTask, WritingVersion).
--
-- Generada a mano, reflejo exacto de prisma/schema.prisma, porque este
-- entorno de generación no tiene acceso de red a los binarios de motor de
-- Prisma para ejecutar `prisma migrate dev` (ver ARCHITECTURE.md). Antes de
-- aplicar en un entorno real, verificar con `npx prisma migrate diff
-- --from-empty --to-schema-datamodel prisma/schema.prisma --script` y
-- reconciliar cualquier diferencia.

-- ============================== ENUMs =====================================

CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING');
CREATE TYPE "DelfLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
CREATE TYPE "LearningPlanStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "WritingSubmissionStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'CORRECTED', 'ARCHIVED');
CREATE TYPE "ExamAttemptStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'EVALUATED', 'CANCELLED');
CREATE TYPE "XpSource" AS ENUM ('ACTIVITY', 'MISSION', 'ACHIEVEMENT', 'DAILY_LOGIN', 'BONUS');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- ============================== user ======================================

CREATE TABLE "user" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Enlace con la identidad de Clerk (12.3/12.4) — ver comentario en
  -- prisma/schema.prisma. No forma parte del listado literal de 13.1.
  "clerk_user_id"  VARCHAR(255) NOT NULL,
  "email"          VARCHAR(255) NOT NULL,
  "password_hash"  TEXT,
  "first_name"     VARCHAR(120) NOT NULL,
  "last_name"      VARCHAR(120) NOT NULL,
  "avatar_url"     TEXT,
  "language"       VARCHAR(10) NOT NULL DEFAULT 'fr',
  "timezone"       VARCHAR(60) NOT NULL DEFAULT 'UTC',
  "status"         "UserStatus" NOT NULL DEFAULT 'PENDING',
  "last_login_at"  TIMESTAMP(3),
  "email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"     TIMESTAMP(3) NOT NULL,
  "deleted_at"     TIMESTAMP(3),
  CONSTRAINT "user_email_key" UNIQUE ("email"),
  CONSTRAINT "user_clerk_user_id_key" UNIQUE ("clerk_user_id")
);
CREATE INDEX "user_status_idx" ON "user" ("status");

-- ========================= student_profile ================================

CREATE TABLE "student_profile" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"         UUID NOT NULL,
  "current_level"   "DelfLevel" NOT NULL,
  "target_level"    "DelfLevel" NOT NULL,
  "native_language" VARCHAR(50) NOT NULL,
  "country"         TEXT,
  "institution"     TEXT,
  "learning_goal"   TEXT,
  "biography"       TEXT,
  -- Cierra la omisión de 13.2 frente a 12.2 ("Perfil pedagógico" incluye
  -- fecha del examen) — ver comentario en prisma/schema.prisma.
  "target_exam_date" DATE,
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP(3) NOT NULL,
  CONSTRAINT "student_profile_user_id_key" UNIQUE ("user_id"),
  CONSTRAINT "student_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =========================== learning_plan ================================

CREATE TABLE "learning_plan" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id"   UUID NOT NULL,
  "name"         TEXT NOT NULL,
  "description"  TEXT,
  "target_level" "DelfLevel" NOT NULL,
  "start_date"   DATE NOT NULL,
  "end_date"     DATE,
  "status"       "LearningPlanStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "learning_plan_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "learning_plan_student_id_idx" ON "learning_plan" ("student_id");
CREATE INDEX "learning_plan_student_id_status_idx" ON "learning_plan" ("student_id", "status");

-- ============================ daily_plan ==================================

CREATE TABLE "daily_plan" (
  "id"                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learning_plan_id"      UUID NOT NULL,
  "plan_date"             DATE NOT NULL,
  "estimated_minutes"     INTEGER NOT NULL,
  "completed_minutes"     INTEGER NOT NULL DEFAULT 0,
  "completion_percentage" DECIMAL(5, 2) NOT NULL DEFAULT 0,
  CONSTRAINT "daily_plan_learning_plan_id_fkey" FOREIGN KEY ("learning_plan_id") REFERENCES "learning_plan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ck_daily_plan_completion_percentage" CHECK ("completion_percentage" BETWEEN 0 AND 100)
);
CREATE INDEX "daily_plan_learning_plan_id_idx" ON "daily_plan" ("learning_plan_id");
CREATE INDEX "daily_plan_learning_plan_id_plan_date_idx" ON "daily_plan" ("learning_plan_id", "plan_date");

-- =========================== weekly_plan ==================================

CREATE TABLE "weekly_plan" (
  "id"                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learning_plan_id"      UUID NOT NULL,
  "week_number"           INTEGER NOT NULL,
  "estimated_minutes"     INTEGER NOT NULL,
  "completed_minutes"     INTEGER NOT NULL DEFAULT 0,
  "completion_percentage" DECIMAL(5, 2) NOT NULL DEFAULT 0,
  CONSTRAINT "weekly_plan_learning_plan_id_fkey" FOREIGN KEY ("learning_plan_id") REFERENCES "learning_plan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ck_weekly_plan_completion_percentage" CHECK ("completion_percentage" BETWEEN 0 AND 100)
);
CREATE INDEX "weekly_plan_learning_plan_id_idx" ON "weekly_plan" ("learning_plan_id");

-- ========================= learning_progress ==============================

CREATE TABLE "learning_progress" (
  "id"                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "learning_plan_id"      UUID NOT NULL,
  "completed_tasks"       INTEGER NOT NULL DEFAULT 0,
  "total_tasks"           INTEGER NOT NULL DEFAULT 0,
  "completion_percentage" DECIMAL(5, 2) NOT NULL DEFAULT 0,
  "current_streak"        INTEGER NOT NULL DEFAULT 0,
  "updated_at"            TIMESTAMP(3) NOT NULL,
  CONSTRAINT "learning_progress_learning_plan_id_key" UNIQUE ("learning_plan_id"),
  CONSTRAINT "learning_progress_learning_plan_id_fkey" FOREIGN KEY ("learning_plan_id") REFERENCES "learning_plan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ck_learning_progress_completion_percentage" CHECK ("completion_percentage" BETWEEN 0 AND 100)
);

-- ========================= writing_submission ==============================

CREATE TABLE "writing_submission" (
  "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id"          UUID NOT NULL,
  "writing_task_id"     UUID NOT NULL, -- FK física a writing_task (fuera de alcance, módulo 06_writing)
  "current_version_id"  UUID,          -- FK física a writing_version (fuera de alcance)
  "status"              "WritingSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
  "submitted_at"        TIMESTAMP(3),
  "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"          TIMESTAMP(3) NOT NULL,
  CONSTRAINT "writing_submission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "writing_submission_student_id_idx" ON "writing_submission" ("student_id");
CREATE INDEX "writing_submission_student_id_status_idx" ON "writing_submission" ("student_id", "status");

-- ============================ writing_draft ================================

CREATE TABLE "writing_draft" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "submission_id"    UUID NOT NULL,
  "content"          TEXT NOT NULL,
  "word_count"       INTEGER NOT NULL DEFAULT 0,
  "character_count"  INTEGER NOT NULL DEFAULT 0,
  "autosaved_at"     TIMESTAMP(3) NOT NULL,
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "writing_draft_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "writing_submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "writing_draft_submission_id_idx" ON "writing_draft" ("submission_id");

-- ============================ exam_attempt =================================

CREATE TABLE "exam_attempt" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id"   UUID NOT NULL,
  "exam_id"      UUID NOT NULL, -- FK física a exam (fuera de alcance, módulo 07_delf_evaluation)
  "started_at"   TIMESTAMP(3),
  "submitted_at" TIMESTAMP(3),
  "finished_at"  TIMESTAMP(3),
  "status"       "ExamAttemptStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "total_score"  DECIMAL(5, 2),
  "passed"       BOOLEAN,
  CONSTRAINT "exam_attempt_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ck_exam_attempt_total_score" CHECK ("total_score" IS NULL OR "total_score" >= 0)
);
CREATE INDEX "exam_attempt_student_id_idx" ON "exam_attempt" ("student_id");
CREATE INDEX "exam_attempt_student_id_status_idx" ON "exam_attempt" ("student_id", "status");

-- ========================== evaluation_result ==============================

CREATE TABLE "evaluation_result" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "attempt_id"       UUID NOT NULL,
  "evaluator_id"     UUID NOT NULL, -- FK física a evaluator (fuera de alcance)
  "final_score"      DECIMAL(5, 2) NOT NULL,
  "percentage"       DECIMAL(5, 2) NOT NULL,
  "passed"           BOOLEAN NOT NULL,
  "overall_feedback" TEXT,
  "evaluated_at"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "evaluation_result_attempt_id_key" UNIQUE ("attempt_id"),
  CONSTRAINT "evaluation_result_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exam_attempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ck_evaluation_result_percentage" CHECK ("percentage" BETWEEN 0 AND 100)
);

-- ========================= coach_recommendation =============================

CREATE TABLE "coach_recommendation" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id"     UUID NOT NULL,
  "recommendation" TEXT NOT NULL,
  "priority"       "Priority" NOT NULL DEFAULT 'MEDIUM',
  "generated_from" TEXT,
  "completed"      BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "coach_recommendation_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "coach_recommendation_student_id_idx" ON "coach_recommendation" ("student_id");
CREATE INDEX "coach_recommendation_student_id_completed_created_at_idx" ON "coach_recommendation" ("student_id", "completed", "created_at");

-- ============================ coach_context ================================

CREATE TABLE "coach_context" (
  "id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id"         UUID NOT NULL,
  "current_level"      "DelfLevel" NOT NULL,
  "target_level"       "DelfLevel" NOT NULL,
  "current_plan_id"    UUID,
  "last_submission_id" UUID,
  "updated_at"         TIMESTAMP(3) NOT NULL,
  CONSTRAINT "coach_context_student_id_key" UNIQUE ("student_id"),
  CONSTRAINT "coach_context_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "coach_context_current_plan_id_fkey" FOREIGN KEY ("current_plan_id") REFERENCES "learning_plan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "coach_context_last_submission_id_fkey" FOREIGN KEY ("last_submission_id") REFERENCES "writing_submission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================== competency ==================================
-- Catálogo mínimo (id, code, name) — ver nota de alcance en prisma/schema.prisma
-- sobre por qué Competency, a diferencia de Exam/Evaluator, sí se incluye.

CREATE TABLE "competency" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code"       VARCHAR(100) NOT NULL,
  "name"       TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "competency_code_key" UNIQUE ("code")
);

-- ========================== student_competency ==============================

CREATE TABLE "student_competency" (
  "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id"          UUID NOT NULL,
  "competency_id"       UUID NOT NULL,
  "current_level"       "DelfLevel" NOT NULL,
  "target_level"        "DelfLevel" NOT NULL,
  "mastery_percentage"  DECIMAL(5, 2) NOT NULL DEFAULT 0,
  "last_updated"        TIMESTAMP(3) NOT NULL,
  CONSTRAINT "student_competency_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "student_competency_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "competency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ck_student_competency_mastery_percentage" CHECK ("mastery_percentage" BETWEEN 0 AND 100)
);
CREATE INDEX "student_competency_student_id_idx" ON "student_competency" ("student_id");
CREATE INDEX "student_competency_student_id_competency_id_idx" ON "student_competency" ("student_id", "competency_id");

-- ========================= competency_progress ==============================

CREATE TABLE "competency_progress" (
  "id"                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_competency_id"  UUID NOT NULL,
  "previous_score"         DECIMAL(5, 2) NOT NULL,
  "current_score"          DECIMAL(5, 2) NOT NULL,
  "improvement"            DECIMAL(5, 2) NOT NULL,
  "recorded_at"            TIMESTAMP(3) NOT NULL,
  CONSTRAINT "competency_progress_student_competency_id_fkey" FOREIGN KEY ("student_competency_id") REFERENCES "student_competency" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "competency_progress_student_competency_id_idx" ON "competency_progress" ("student_competency_id");

-- =========================== learning_metric ================================

CREATE TABLE "learning_metric" (
  "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id"          UUID NOT NULL,
  "study_time_minutes"  INTEGER NOT NULL DEFAULT 0,
  "completed_sessions"  INTEGER NOT NULL DEFAULT 0,
  "completed_tasks"     INTEGER NOT NULL DEFAULT 0,
  "active_days"         INTEGER NOT NULL DEFAULT 0,
  "calculated_at"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "learning_metric_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "learning_metric_student_id_idx" ON "learning_metric" ("student_id");
CREATE INDEX "learning_metric_student_id_calculated_at_idx" ON "learning_metric" ("student_id", "calculated_at");

-- ========================== performance_metric ===============================

CREATE TABLE "performance_metric" (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id"        UUID NOT NULL,
  "average_score"     DECIMAL(5, 2) NOT NULL,
  "success_rate"      DECIMAL(5, 2) NOT NULL,
  "average_feedback"  DECIMAL(5, 2) NOT NULL,
  "evaluated_at"      TIMESTAMP(3) NOT NULL,
  CONSTRAINT "performance_metric_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ck_performance_metric_success_rate" CHECK ("success_rate" BETWEEN 0 AND 100)
);
CREATE INDEX "performance_metric_student_id_idx" ON "performance_metric" ("student_id");
CREATE INDEX "performance_metric_student_id_evaluated_at_idx" ON "performance_metric" ("student_id", "evaluated_at");

-- ========================== learning_analytics ===============================

CREATE TABLE "learning_analytics" (
  "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id"          UUID NOT NULL,
  "productivity_index"  DECIMAL(5, 2) NOT NULL,
  "engagement_index"    DECIMAL(5, 2) NOT NULL,
  "consistency_index"   DECIMAL(5, 2) NOT NULL,
  "progression_index"   DECIMAL(5, 2) NOT NULL,
  "updated_at"          TIMESTAMP(3) NOT NULL,
  CONSTRAINT "learning_analytics_student_id_key" UNIQUE ("student_id"),
  CONSTRAINT "learning_analytics_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ck_learning_analytics_indexes" CHECK (
    "productivity_index" BETWEEN 0 AND 100 AND
    "engagement_index" BETWEEN 0 AND 100 AND
    "consistency_index" BETWEEN 0 AND 100 AND
    "progression_index" BETWEEN 0 AND 100
  )
);

-- =========================== student_dashboard ================================

CREATE TABLE "student_dashboard" (
  "id"                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id"            UUID NOT NULL,
  "current_level"         "DelfLevel" NOT NULL,
  "total_xp"              INTEGER NOT NULL DEFAULT 0,
  "completed_activities"  INTEGER NOT NULL DEFAULT 0,
  "completed_plans"       INTEGER NOT NULL DEFAULT 0,
  "current_streak"        INTEGER NOT NULL DEFAULT 0,
  "updated_at"            TIMESTAMP(3) NOT NULL,
  CONSTRAINT "student_dashboard_student_id_key" UNIQUE ("student_id"),
  CONSTRAINT "student_dashboard_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ck_student_dashboard_total_xp" CHECK ("total_xp" >= 0)
);

-- ================================ streak ========================================

CREATE TABLE "streak" (
  "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id"          UUID NOT NULL,
  "current_count"       INTEGER NOT NULL DEFAULT 0,
  "longest_count"       INTEGER NOT NULL DEFAULT 0,
  "last_activity_date"  DATE,
  "updated_at"          TIMESTAMP(3) NOT NULL,
  CONSTRAINT "streak_student_id_key" UNIQUE ("student_id"),
  CONSTRAINT "streak_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ck_streak_counts" CHECK ("current_count" >= 0 AND "longest_count" >= 0)
);

-- ============================= student_level ====================================

CREATE TABLE "student_level" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id"    UUID NOT NULL,
  "level_number"  INTEGER NOT NULL DEFAULT 1,
  "achieved_at"   TIMESTAMP(3) NOT NULL,
  "updated_at"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "student_level_student_id_key" UNIQUE ("student_id"),
  CONSTRAINT "student_level_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ck_student_level_number" CHECK ("level_number" >= 1)
);

-- ============================= xp_transaction ====================================

CREATE TABLE "xp_transaction" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id"   UUID NOT NULL,
  "amount"       INTEGER NOT NULL,
  "source"       "XpSource" NOT NULL,
  "description"  TEXT,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "xp_transaction_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "xp_transaction_student_id_idx" ON "xp_transaction" ("student_id");
CREATE INDEX "xp_transaction_student_id_created_at_idx" ON "xp_transaction" ("student_id", "created_at");

-- Particionamiento por rango de fecha (sección 15.x, mencionado para
-- XPTransaction como tabla de gran crecimiento) queda fuera de esta
-- migración inicial — se añadirá en una migración dedicada cuando el
-- volumen real lo justifique (13.14: cambios compatibles/incrementales).
