-- Rollback de: 202607171400_my_plan_rls_policies
-- Revoca los GRANT añadidos y elimina las policies/RLS de las 6 tablas
-- nuevas, en orden inverso. No toca las políticas ya auditadas de las 4
-- tablas existentes (learning_plan, daily_plan, weekly_plan,
-- learning_progress), salvo revocar el GRANT de escritura añadido aquí
-- para dashboard_service_role.

REVOKE SELECT, INSERT, UPDATE ON "learning_plan", "daily_plan", "weekly_plan", "learning_progress" FROM dashboard_service_role;

REVOKE SELECT, INSERT, UPDATE ON
  "learning_goal", "learning_objective", "learning_phase",
  "learning_task", "study_schedule", "study_session"
FROM dashboard_service_role;

REVOKE INSERT, UPDATE ON "study_session" FROM dashboard_app_role;
REVOKE UPDATE ON "learning_objective", "learning_task", "study_schedule" FROM dashboard_app_role;
REVOKE SELECT ON
  "learning_goal", "learning_objective", "learning_phase",
  "learning_task", "study_schedule", "study_session"
FROM dashboard_app_role;

DROP POLICY IF EXISTS "study_session_service_write" ON "study_session";
DROP POLICY IF EXISTS "study_session_self_update" ON "study_session";
DROP POLICY IF EXISTS "study_session_self_insert" ON "study_session";
DROP POLICY IF EXISTS "study_session_self_access" ON "study_session";
ALTER TABLE "study_session" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "study_schedule_service_write" ON "study_schedule";
DROP POLICY IF EXISTS "study_schedule_self_update" ON "study_schedule";
DROP POLICY IF EXISTS "study_schedule_self_access" ON "study_schedule";
ALTER TABLE "study_schedule" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "learning_task_service_write" ON "learning_task";
DROP POLICY IF EXISTS "learning_task_self_update" ON "learning_task";
DROP POLICY IF EXISTS "learning_task_self_access" ON "learning_task";
ALTER TABLE "learning_task" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "learning_phase_service_write" ON "learning_phase";
DROP POLICY IF EXISTS "learning_phase_self_access" ON "learning_phase";
ALTER TABLE "learning_phase" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "learning_objective_service_write" ON "learning_objective";
DROP POLICY IF EXISTS "learning_objective_self_update" ON "learning_objective";
DROP POLICY IF EXISTS "learning_objective_self_access" ON "learning_objective";
ALTER TABLE "learning_objective" DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "learning_goal_service_write" ON "learning_goal";
DROP POLICY IF EXISTS "learning_goal_self_access" ON "learning_goal";
ALTER TABLE "learning_goal" DISABLE ROW LEVEL SECURITY;
