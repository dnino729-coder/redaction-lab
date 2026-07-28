-- ACADEMIA — Sprint 6.2 Infrastructure Layer.
-- Extensión aditiva: 11 enums + 10 tablas nuevas. No modifica ninguna tabla
-- ni enum ya existente. Consistente con Persistence Layer Specification
-- v1.0 (Sprint 5.1, Frozen) y prisma/schema.prisma (misma migración).

-- --- ENUMs -------------------------------------------------------------
CREATE TYPE "AcademyUnitState" AS ENUM ('LOCKED','UNLOCKED','IN_PROGRESS','AWAITING_FEEDBACK','REVISION','REFLECTION','COMPLETED','MASTERED');
CREATE TYPE "AcademyUnitStep" AS ENUM ('CONTEXTUALIZE','DEFINE_OBJECTIVES','COMPREHEND','OBSERVE','ANALYZE','PRACTICE','PRODUCE','RECEIVE_FEEDBACK','REWRITE','REFLECT','UNLOCK');
CREATE TYPE "AcademyTextType" AS ENUM ('LETTER','ARTICLE','ESSAY','EMAIL','REPORT');
CREATE TYPE "AcademyDifficultyLevel" AS ENUM ('EASY','MEDIUM','HARD');
CREATE TYPE "AcademyFeedbackCategory" AS ENUM ('COMPREHENSION','COMMUNICATIVE_INTENT','STRUCTURE','COHERENCE','COHESION','ARGUMENTATION','REGISTER','VOCABULARY','GRAMMAR','SPELLING');
CREATE TYPE "AcademyMasteryLevel" AS ENUM ('DEVELOPING','CONSOLIDATING','SUSTAINED');
CREATE TYPE "AcademyFeedbackStrength" AS ENUM ('STRENGTH','WEAKNESS');
CREATE TYPE "AcademyOverrideAction" AS ENUM ('FORCE_LOCK','FORCE_RESTART');
CREATE TYPE "ModelExampleRating" AS ENUM ('EXCELLENT','HAS_ERRORS');
CREATE TYPE "ModelExampleStatus" AS ENUM ('ACTIVE','RETIRED');
CREATE TYPE "AcademyOutboxStatus" AS ENUM ('PENDING','PUBLISHED','FAILED','DEAD_LETTER');
CREATE TYPE "AcademyOutboxAggregateType" AS ENUM ('ACADEMY_UNIT','ATTEMPT');

-- --- academy_unit (sin FK activeAttemptId todavía) ----------------------
CREATE TABLE "academy_unit" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "student_id" UUID NOT NULL,
  "text_type" "AcademyTextType" NOT NULL,
  "position" INTEGER NOT NULL,
  "state" "AcademyUnitState" NOT NULL DEFAULT 'LOCKED',
  "active_attempt_id" UUID,
  "completed_at" TIMESTAMP(3),
  "mastered_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pk_academy_unit" PRIMARY KEY ("id")
);

-- --- attempt -------------------------------------------------------------
CREATE TABLE "attempt" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "academy_unit_id" UUID NOT NULL,
  "current_step" "AcademyUnitStep" NOT NULL DEFAULT 'CONTEXTUALIZE',
  "comprehension_verified" BOOLEAN NOT NULL DEFAULT false,
  "attempt_number" INTEGER NOT NULL,
  "is_current" BOOLEAN NOT NULL DEFAULT true,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pk_attempt" PRIMARY KEY ("id")
);

ALTER TABLE "academy_unit" ADD CONSTRAINT "fk_academy_unit_active_attempt_id" FOREIGN KEY ("active_attempt_id") REFERENCES "attempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "attempt" ADD CONSTRAINT "fk_attempt_academy_unit_id" FOREIGN KEY ("academy_unit_id") REFERENCES "academy_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "academy_unit" ADD CONSTRAINT "fk_academy_unit_student_id" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- --- draft ---------------------------------------------------------------
CREATE TABLE "draft" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "attempt_id" UUID NOT NULL,
  "content" TEXT NOT NULL,
  "word_count" INTEGER NOT NULL DEFAULT 0,
  "character_count" INTEGER NOT NULL DEFAULT 0,
  "last_saved_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pk_draft" PRIMARY KEY ("id")
);
ALTER TABLE "draft" ADD CONSTRAINT "fk_draft_attempt_id" FOREIGN KEY ("attempt_id") REFERENCES "attempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- --- version ---------------------------------------------------------------
CREATE TABLE "version" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "attempt_id" UUID NOT NULL,
  "version_number" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pk_version" PRIMARY KEY ("id")
);
ALTER TABLE "version" ADD CONSTRAINT "fk_version_attempt_id" FOREIGN KEY ("attempt_id") REFERENCES "attempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- --- feedback ---------------------------------------------------------------
CREATE TABLE "feedback" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "version_id" UUID NOT NULL,
  "delivered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pk_feedback" PRIMARY KEY ("id")
);
ALTER TABLE "feedback" ADD CONSTRAINT "fk_feedback_version_id" FOREIGN KEY ("version_id") REFERENCES "version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- --- feedback_observation ----------------------------------------------
CREATE TABLE "feedback_observation" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "feedback_id" UUID NOT NULL,
  "category" "AcademyFeedbackCategory" NOT NULL,
  "strength" "AcademyFeedbackStrength" NOT NULL,
  "explanation" TEXT NOT NULL,
  "suggestion" TEXT NOT NULL,
  CONSTRAINT "pk_feedback_observation" PRIMARY KEY ("id")
);
ALTER TABLE "feedback_observation" ADD CONSTRAINT "fk_feedback_observation_feedback_id" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- --- teacher_override ----------------------------------------------------
CREATE TABLE "teacher_override" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "academy_unit_id" UUID NOT NULL,
  "action" "AcademyOverrideAction" NOT NULL,
  "teacher_id" UUID NOT NULL,
  "reason" TEXT NOT NULL,
  "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pk_teacher_override" PRIMARY KEY ("id")
);
ALTER TABLE "teacher_override" ADD CONSTRAINT "fk_teacher_override_academy_unit_id" FOREIGN KEY ("academy_unit_id") REFERENCES "academy_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "teacher_override" ADD CONSTRAINT "fk_teacher_override_teacher_id" FOREIGN KEY ("teacher_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- --- model_example (sin dependencias) ------------------------------------
CREATE TABLE "model_example" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "text_type" "AcademyTextType" NOT NULL,
  "content" TEXT NOT NULL,
  "rating" "ModelExampleRating" NOT NULL,
  "curatorial_comment" TEXT NOT NULL,
  "status" "ModelExampleStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "retired_at" TIMESTAMP(3),
  CONSTRAINT "pk_model_example" PRIMARY KEY ("id")
);

-- --- teacher_recommendation ----------------------------------------------
CREATE TABLE "teacher_recommendation" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "academy_unit_id" UUID NOT NULL,
  "student_id" UUID NOT NULL,
  "teacher_id" UUID NOT NULL,
  "recommended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pk_teacher_recommendation" PRIMARY KEY ("id")
);
ALTER TABLE "teacher_recommendation" ADD CONSTRAINT "fk_teacher_recommendation_academy_unit_id" FOREIGN KEY ("academy_unit_id") REFERENCES "academy_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "teacher_recommendation" ADD CONSTRAINT "fk_teacher_recommendation_student_id" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "teacher_recommendation" ADD CONSTRAINT "fk_teacher_recommendation_teacher_id" FOREIGN KEY ("teacher_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- --- academy_outbox (infraestructura pura, sin FK) -----------------------
CREATE TABLE "academy_outbox" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "event_id" UUID NOT NULL,
  "event_name" TEXT NOT NULL,
  "aggregate_id" UUID NOT NULL,
  "aggregate_type" "AcademyOutboxAggregateType" NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "AcademyOutboxStatus" NOT NULL DEFAULT 'PENDING',
  "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "published_at" TIMESTAMP(3),
  "retry_count" INTEGER NOT NULL DEFAULT 0,
  "last_error" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pk_academy_outbox" PRIMARY KEY ("id")
);

-- --- UNIQUE constraints ---------------------------------------------------
CREATE UNIQUE INDEX "uq_academy_unit_active_attempt_id" ON "academy_unit"("active_attempt_id");
CREATE UNIQUE INDEX "uq_academy_unit_student_text_type_position" ON "academy_unit"("student_id", "text_type", "position");
CREATE UNIQUE INDEX "uq_draft_attempt_id" ON "draft"("attempt_id");
CREATE UNIQUE INDEX "uq_version_attempt_id_version_number" ON "version"("attempt_id", "version_number");
CREATE UNIQUE INDEX "uq_feedback_version_id" ON "feedback"("version_id");
CREATE UNIQUE INDEX "uq_academy_outbox_event_id" ON "academy_outbox"("event_id");

-- --- Índices no únicos -----------------------------------------------------
CREATE INDEX "idx_academy_unit_student_id" ON "academy_unit"("student_id");
CREATE INDEX "idx_academy_unit_student_id_text_type" ON "academy_unit"("student_id", "text_type");
CREATE INDEX "idx_academy_unit_student_id_state" ON "academy_unit"("student_id", "state");
CREATE INDEX "idx_attempt_academy_unit_id" ON "attempt"("academy_unit_id");
CREATE INDEX "idx_attempt_academy_unit_id_is_current" ON "attempt"("academy_unit_id", "is_current");
CREATE INDEX "idx_version_attempt_id" ON "version"("attempt_id");
CREATE INDEX "idx_feedback_observation_feedback_id" ON "feedback_observation"("feedback_id");
CREATE INDEX "idx_teacher_override_academy_unit_id" ON "teacher_override"("academy_unit_id");
CREATE INDEX "idx_teacher_override_teacher_id" ON "teacher_override"("teacher_id");
CREATE INDEX "idx_model_example_text_type_status" ON "model_example"("text_type", "status");
CREATE INDEX "idx_teacher_recommendation_student_id" ON "teacher_recommendation"("student_id");
CREATE INDEX "idx_teacher_recommendation_teacher_id" ON "teacher_recommendation"("teacher_id");
CREATE INDEX "idx_teacher_recommendation_academy_unit_id" ON "teacher_recommendation"("academy_unit_id");
CREATE INDEX "idx_academy_outbox_status" ON "academy_outbox"("status");
CREATE INDEX "idx_academy_outbox_aggregate_id_aggregate_type" ON "academy_outbox"("aggregate_id", "aggregate_type");
CREATE INDEX "idx_academy_outbox_status_occurred_at" ON "academy_outbox"("status", "occurred_at");
