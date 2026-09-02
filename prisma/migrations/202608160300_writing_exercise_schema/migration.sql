-- LABORATOIRE — ejercicios guiados y autónomos de producción escrita.
-- Bounded context independiente de Academia: sin FK ni relación hacia
-- academy_unit/attempt/draft/version/feedback/writing_submission.
-- Migración única: esquema + índices + restricciones + RLS + GRANT
-- (sin separar los GRANT en una migración posterior, a diferencia de lo
-- que ocurrió con Academia — lección ya aplicada aquí desde el inicio).

-- --- ENUMs -------------------------------------------------------------
CREATE TYPE "ExerciseMode" AS ENUM ('GUIDED', 'AUTONOMOUS');
CREATE TYPE "ExerciseAttemptStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "WritingExerciseTextType" AS ENUM ('LETTER', 'ARTICLE', 'ESSAY', 'EMAIL', 'REPORT');

-- --- writing_exercise ----------------------------------------------------
CREATE TABLE "writing_exercise" (
  "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
  "student_id"    UUID NOT NULL,
  "mode"          "ExerciseMode" NOT NULL,
  "text_type"     "WritingExerciseTextType" NOT NULL,
  "guided_prompt" TEXT,
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pk_writing_exercise" PRIMARY KEY ("id")
);

-- --- exercise_attempt ------------------------------------------------------
CREATE TABLE "exercise_attempt" (
  "id"                  UUID NOT NULL DEFAULT gen_random_uuid(),
  "writing_exercise_id" UUID NOT NULL,
  "attempt_number"      INTEGER NOT NULL,
  "status"              "ExerciseAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "content"             TEXT NOT NULL DEFAULT '',
  "word_count"          INTEGER NOT NULL DEFAULT 0,
  "started_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at"        TIMESTAMP(3),
  "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"          TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pk_exercise_attempt" PRIMARY KEY ("id")
);

-- --- Foreign Keys ----------------------------------------------------------
ALTER TABLE "writing_exercise" ADD CONSTRAINT "fk_writing_exercise_student_id"
  FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "exercise_attempt" ADD CONSTRAINT "fk_exercise_attempt_writing_exercise_id"
  FOREIGN KEY ("writing_exercise_id") REFERENCES "writing_exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- --- Restricciones de unicidad ----------------------------------------------
CREATE UNIQUE INDEX "uq_exercise_attempt_writing_exercise_id_attempt_number"
  ON "exercise_attempt"("writing_exercise_id", "attempt_number");

-- Índice único PARCIAL — no expresable en schema.prisma. Refuerza a nivel
-- de BD la invariante de dominio "un solo intento activo por ejercicio"
-- (FASE 2 punto 2 / FASE 3 §4), como defensa en profundidad además de la
-- validación ya aplicada en el Command Handler.
CREATE UNIQUE INDEX "uq_exercise_attempt_single_active"
  ON "exercise_attempt"("writing_exercise_id")
  WHERE "status" = 'IN_PROGRESS';

-- --- Índices no únicos -------------------------------------------------------
CREATE INDEX "idx_writing_exercise_student_id" ON "writing_exercise"("student_id");
CREATE INDEX "idx_writing_exercise_student_id_mode" ON "writing_exercise"("student_id", "mode");
CREATE INDEX "idx_exercise_attempt_writing_exercise_id" ON "exercise_attempt"("writing_exercise_id");
CREATE INDEX "idx_exercise_attempt_writing_exercise_id_status" ON "exercise_attempt"("writing_exercise_id", "status");

-- ============================================================================
-- RLS — reutiliza dashboard_app_role/dashboard_service_role y
-- current_student_id() ya creados por 202607170900_dashboard_rls_policies.
-- No crea ningún rol nuevo.
-- ============================================================================

ALTER TABLE "writing_exercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "writing_exercise" FORCE ROW LEVEL SECURITY;

CREATE POLICY "writing_exercise_self_access" ON "writing_exercise"
  FOR SELECT USING ("student_id" = current_student_id());

CREATE POLICY "writing_exercise_self_insert" ON "writing_exercise"
  FOR INSERT TO dashboard_app_role
  WITH CHECK ("student_id" = current_student_id());

-- writing_exercise es inmutable tras su creación (ninguna operación de
-- dominio la modifica) — sin política de UPDATE ni DELETE para
-- dashboard_app_role, principio de permisos mínimos.
CREATE POLICY "writing_exercise_service_write" ON "writing_exercise"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

ALTER TABLE "exercise_attempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exercise_attempt" FORCE ROW LEVEL SECURITY;

CREATE POLICY "exercise_attempt_self_access" ON "exercise_attempt"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "writing_exercise" we
      WHERE we."id" = "exercise_attempt"."writing_exercise_id"
        AND we."student_id" = current_student_id()
    )
  );

CREATE POLICY "exercise_attempt_self_insert" ON "exercise_attempt"
  FOR INSERT TO dashboard_app_role
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "writing_exercise" we
      WHERE we."id" = "exercise_attempt"."writing_exercise_id"
        AND we."student_id" = current_student_id()
    )
  );

CREATE POLICY "exercise_attempt_self_update" ON "exercise_attempt"
  FOR UPDATE TO dashboard_app_role
  USING (
    EXISTS (
      SELECT 1 FROM "writing_exercise" we
      WHERE we."id" = "exercise_attempt"."writing_exercise_id"
        AND we."student_id" = current_student_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "writing_exercise" we
      WHERE we."id" = "exercise_attempt"."writing_exercise_id"
        AND we."student_id" = current_student_id()
    )
  );

-- Ninguna operación de dominio borra un writing_exercise ni un
-- exercise_attempt (ni siquiera al repetir — el historial se conserva) —
-- sin política de DELETE para dashboard_app_role.
CREATE POLICY "exercise_attempt_service_write" ON "exercise_attempt"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- GRANT de nivel de tabla — en la MISMA migración que las políticas RLS
-- (lección aplicada de Academia: RLS nunca sustituye al GRANT, y
-- desacoplarlos entre migraciones causó 3 bloqueos de producción allí).
-- Permisos mínimos: dashboard_app_role necesita exactamente lo que sus
-- políticas de arriba habilitan (incluida la lectura de idempotencia que
-- los Command Handlers hacen bajo su propio contexto, no bajo servicio).
-- ============================================================================

GRANT SELECT, INSERT ON "writing_exercise" TO dashboard_app_role;
GRANT SELECT, INSERT, UPDATE ON "exercise_attempt" TO dashboard_app_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON "writing_exercise", "exercise_attempt" TO dashboard_service_role;
