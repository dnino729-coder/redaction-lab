-- Rollback de la migración `202607170900_dashboard_rls_policies`.
-- Orden inverso de dependencias: revocar privilegios de tabla antes de
-- eliminar los roles a los que se otorgaron; eliminar políticas antes de
-- desactivar RLS; eliminar la función usada por las políticas al final.

-- Privilegios de nivel de tabla.
REVOKE dashboard_app_role, dashboard_service_role FROM CURRENT_USER;
REVOKE SELECT, INSERT, UPDATE ON "user" FROM dashboard_service_role;
REVOKE INSERT, UPDATE, SELECT ON "student_dashboard" FROM dashboard_service_role;
REVOKE SELECT ON
  "user", "student_profile", "learning_plan", "daily_plan", "weekly_plan",
  "learning_progress", "writing_submission", "writing_draft", "exam_attempt",
  "evaluation_result", "coach_recommendation", "coach_context", "competency",
  "student_competency", "competency_progress", "learning_metric",
  "performance_metric", "learning_analytics", "streak", "student_level",
  "xp_transaction", "student_dashboard"
FROM dashboard_app_role;

-- Políticas de student_dashboard.
DROP POLICY IF EXISTS "student_dashboard_service_write" ON "student_dashboard";
DROP POLICY IF EXISTS "student_dashboard_self_read" ON "student_dashboard";
ALTER TABLE "student_dashboard" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "student_dashboard" DISABLE ROW LEVEL SECURITY;

-- Políticas del resto de tablas (mismo orden que migration.sql).
DROP POLICY IF EXISTS "xp_transaction_self_access" ON "xp_transaction";
ALTER TABLE "xp_transaction" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "xp_transaction" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_level_self_access" ON "student_level";
ALTER TABLE "student_level" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "student_level" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "streak_self_access" ON "streak";
ALTER TABLE "streak" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "streak" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "learning_analytics_self_access" ON "learning_analytics";
ALTER TABLE "learning_analytics" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "learning_analytics" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "performance_metric_self_access" ON "performance_metric";
ALTER TABLE "performance_metric" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "performance_metric" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "learning_metric_self_access" ON "learning_metric";
ALTER TABLE "learning_metric" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "learning_metric" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "competency_progress_self_access" ON "competency_progress";
ALTER TABLE "competency_progress" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "competency_progress" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_competency_self_access" ON "student_competency";
ALTER TABLE "student_competency" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "student_competency" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "competency_authenticated_read" ON "competency";
ALTER TABLE "competency" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "competency" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coach_context_self_access" ON "coach_context";
ALTER TABLE "coach_context" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "coach_context" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coach_recommendation_self_access" ON "coach_recommendation";
ALTER TABLE "coach_recommendation" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "coach_recommendation" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "evaluation_result_self_access" ON "evaluation_result";
ALTER TABLE "evaluation_result" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "evaluation_result" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exam_attempt_self_access" ON "exam_attempt";
ALTER TABLE "exam_attempt" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "exam_attempt" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "writing_draft_self_access" ON "writing_draft";
ALTER TABLE "writing_draft" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "writing_draft" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "writing_submission_self_access" ON "writing_submission";
ALTER TABLE "writing_submission" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "writing_submission" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "learning_progress_self_access" ON "learning_progress";
ALTER TABLE "learning_progress" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "learning_progress" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "weekly_plan_self_access" ON "weekly_plan";
ALTER TABLE "weekly_plan" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "weekly_plan" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_plan_self_access" ON "daily_plan";
ALTER TABLE "daily_plan" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "daily_plan" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "learning_plan_self_access" ON "learning_plan";
ALTER TABLE "learning_plan" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "learning_plan" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_profile_self_access" ON "student_profile";
ALTER TABLE "student_profile" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "student_profile" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_self_access" ON "user";
ALTER TABLE "user" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;

-- Función auxiliar.
DROP FUNCTION IF EXISTS current_student_id();

-- Privilegio de esquema.
REVOKE USAGE ON SCHEMA public FROM dashboard_app_role, dashboard_service_role;

-- Roles (fallan si aún tienen privilegios/objetos dependientes sin revocar
-- arriba — comportamiento intencional: revela cualquier GRANT olvidado).
DROP ROLE IF EXISTS dashboard_service_role;
DROP ROLE IF EXISTS dashboard_app_role;
