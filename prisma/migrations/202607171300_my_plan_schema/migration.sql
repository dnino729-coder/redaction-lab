-- Migración: 202607171300_my_plan_schema
-- Módulo funcional: Mi Plan (13.14: una migración, un módulo funcional).
-- Origen: docs/modules/mi-plan.md (Arquitectura Definitiva, Fase 3.2) y
-- resoluciones 18.20/18.21. Alcance: EXCLUSIVAMENTE las 6 entidades de 13.4
-- que aún no existían — LearningGoal, LearningObjective, LearningPhase,
-- LearningTask, StudySchedule, StudySession. No crea, elimina ni modifica
-- ninguna columna, constraint o índice de las 4 tablas ya existentes
-- (learning_plan, daily_plan, weekly_plan, learning_progress) creadas por
-- 202607161000, ni de ninguna otra tabla del proyecto.
--
-- Nomenclatura de constraints/índices: pk_/fk_/uq_/idx_/ck_ aplicada desde
-- el origen (13.13, reforzada por 18.20.12) — a diferencia de
-- 202607161000, esta migración no necesitará una corrección de nomenclatura
-- posterior.
--
-- Generada a mano, mismo motivo que las migraciones anteriores (sin acceso
-- de red a los binarios de motor de Prisma en este entorno). Verificar con
-- `npx prisma migrate diff --from-schema-datasource prisma/schema.prisma
-- --to-schema-datamodel prisma/schema.prisma --script` antes de aplicar en
-- un entorno real.

-- ============================== ENUMs =====================================

CREATE TYPE "LearningGoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "LearningObjectiveStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "LearningPhaseStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "LearningTaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "LearningTaskDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT');
CREATE TYPE "LearningTaskSource" AS ENUM ('SELF_DIRECTED', 'ACADEMY', 'LABORATORY', 'DAILY_TRAINING', 'SIMULATOR');

-- ============================ learning_goal ================================
-- Rama "objetivos" bajo learning_plan (independiente de la rama
-- learning_phase/learning_task — ver nota de relaciones en 13.4).

CREATE TABLE "learning_goal" (
  "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
  "learning_plan_id" UUID NOT NULL,
  "title"            TEXT NOT NULL,
  "description"      TEXT,
  "priority"         "Priority" NOT NULL DEFAULT 'MEDIUM',
  "target_date"      DATE,
  "completed_at"     TIMESTAMP(3),
  "status"           "LearningGoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
  CONSTRAINT "pk_learning_goal" PRIMARY KEY ("id"),
  CONSTRAINT "fk_learning_goal_learning_plan_id" FOREIGN KEY ("learning_plan_id") REFERENCES "learning_plan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ck_learning_goal_completed_at_consistency" CHECK ( ("completed_at" IS NOT NULL) = ("status" = 'COMPLETED') )
);
CREATE INDEX "idx_learning_goal_learning_plan_id" ON "learning_goal" ("learning_plan_id");
CREATE INDEX "idx_learning_goal_learning_plan_id_status" ON "learning_goal" ("learning_plan_id", "status");

-- ========================= learning_objective ==============================

CREATE TABLE "learning_objective" (
  "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
  "learning_goal_id" UUID NOT NULL,
  "title"            TEXT NOT NULL,
  "description"      TEXT,
  "order_number"     INTEGER NOT NULL,
  "completed_at"     TIMESTAMP(3),
  "status"           "LearningObjectiveStatus" NOT NULL DEFAULT 'NOT_STARTED',
  CONSTRAINT "pk_learning_objective" PRIMARY KEY ("id"),
  CONSTRAINT "fk_learning_objective_learning_goal_id" FOREIGN KEY ("learning_goal_id") REFERENCES "learning_goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ck_learning_objective_completed_at_consistency" CHECK ( ("completed_at" IS NOT NULL) = ("status" = 'COMPLETED') )
);
CREATE INDEX "idx_learning_objective_learning_goal_id" ON "learning_objective" ("learning_goal_id");
CREATE INDEX "idx_learning_objective_learning_goal_id_status" ON "learning_objective" ("learning_goal_id", "status");

-- ============================ learning_phase ================================
-- Rama "fases/tareas" bajo learning_plan (independiente de la rama
-- learning_goal/learning_objective).

CREATE TABLE "learning_phase" (
  "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
  "learning_plan_id" UUID NOT NULL,
  "name"             TEXT NOT NULL,
  "phase_order"      INTEGER NOT NULL,
  "start_date"       DATE NOT NULL,
  "end_date"         DATE,
  "completed_at"     TIMESTAMP(3),
  "status"           "LearningPhaseStatus" NOT NULL DEFAULT 'NOT_STARTED',
  CONSTRAINT "pk_learning_phase" PRIMARY KEY ("id"),
  CONSTRAINT "fk_learning_phase_learning_plan_id" FOREIGN KEY ("learning_plan_id") REFERENCES "learning_plan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ck_learning_phase_completed_at_consistency" CHECK ( ("completed_at" IS NOT NULL) = ("status" = 'COMPLETED') )
);
CREATE INDEX "idx_learning_phase_learning_plan_id" ON "learning_phase" ("learning_plan_id");
CREATE INDEX "idx_learning_phase_learning_plan_id_status" ON "learning_phase" ("learning_plan_id", "status");

-- ============================= learning_task ================================

CREATE TABLE "learning_task" (
  "id"                UUID NOT NULL DEFAULT gen_random_uuid(),
  "learning_phase_id" UUID NOT NULL,
  "title"             TEXT NOT NULL,
  "description"       TEXT,
  "estimated_minutes" INTEGER NOT NULL,
  "difficulty"        "LearningTaskDifficulty" NOT NULL DEFAULT 'MEDIUM',
  "due_date"          DATE,
  "completed_at"      TIMESTAMP(3),
  "status"            "LearningTaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "source"            "LearningTaskSource" NOT NULL DEFAULT 'SELF_DIRECTED',
  CONSTRAINT "pk_learning_task" PRIMARY KEY ("id"),
  CONSTRAINT "fk_learning_task_learning_phase_id" FOREIGN KEY ("learning_phase_id") REFERENCES "learning_phase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ck_learning_task_completed_at_consistency" CHECK ( ("completed_at" IS NOT NULL) = ("status" = 'COMPLETED') )
);
CREATE INDEX "idx_learning_task_learning_phase_id" ON "learning_task" ("learning_phase_id");
CREATE INDEX "idx_learning_task_learning_phase_id_status" ON "learning_task" ("learning_phase_id", "status");
CREATE INDEX "idx_learning_task_source" ON "learning_task" ("source");
CREATE INDEX "idx_learning_task_due_date" ON "learning_task" ("due_date");

-- ============================ study_schedule ================================
-- 1:1 con learning_plan — la propia UNIQUE ya sirve de índice de búsqueda
-- por learning_plan_id, no se crea un índice adicional redundante.

CREATE TABLE "study_schedule" (
  "id"                  UUID NOT NULL DEFAULT gen_random_uuid(),
  "learning_plan_id"    UUID NOT NULL,
  "days_per_week"       INTEGER NOT NULL,
  "sessions_per_day"    INTEGER NOT NULL,
  "minutes_per_session" INTEGER NOT NULL,
  "reminder_time"       TIME,
  CONSTRAINT "pk_study_schedule" PRIMARY KEY ("id"),
  CONSTRAINT "uq_study_schedule_learning_plan_id" UNIQUE ("learning_plan_id"),
  CONSTRAINT "fk_study_schedule_learning_plan_id" FOREIGN KEY ("learning_plan_id") REFERENCES "learning_plan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================= study_session ================================
-- Única de las 6 tablas con student_id propio (13.4: "User 1:N
-- StudySession") — evita 3 niveles de join en su política RLS.

CREATE TABLE "study_session" (
  "id"                UUID NOT NULL DEFAULT gen_random_uuid(),
  "student_id"        UUID NOT NULL,
  "learning_task_id"  UUID NOT NULL,
  "started_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finished_at"       TIMESTAMP(3),
  "duration_minutes"  INTEGER,
  "completed"         BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT "pk_study_session" PRIMARY KEY ("id"),
  CONSTRAINT "fk_study_session_student_id" FOREIGN KEY ("student_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_study_session_learning_task_id" FOREIGN KEY ("learning_task_id") REFERENCES "learning_task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ck_study_session_duration_minutes" CHECK ("duration_minutes" IS NULL OR "duration_minutes" >= 0)
);
CREATE INDEX "idx_study_session_student_id" ON "study_session" ("student_id");
CREATE INDEX "idx_study_session_learning_task_id" ON "study_session" ("learning_task_id");
CREATE INDEX "idx_study_session_student_id_started_at" ON "study_session" ("student_id", "started_at");

-- ============================================================================
-- Resumen: 6 tablas, 6 tipos ENUM, 6 PRIMARY KEY, 7 FOREIGN KEY, 1 UNIQUE,
-- 4 CHECK (invariante completed_at/status, 18.21), 13 INDEX. Ninguna
-- modificación sobre las tablas ya existentes.
-- ============================================================================
