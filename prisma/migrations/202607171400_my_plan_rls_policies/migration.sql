-- Row Level Security — módulo Mi Plan.
-- Aplica exactamente el mismo patrón ya auditado para el Dashboard
-- (202607170900_dashboard_rls_policies): mismos dos roles
-- (dashboard_app_role / dashboard_service_role), mismo mecanismo
-- (SET LOCAL ROLE + current_student_id() fijado por
-- database/repositories/withStudentContext.ts), mismo uso de
-- FORCE ROW LEVEL SECURITY como defensa en profundidad. No crea ningún rol
-- de Postgres nuevo.
--
-- ============================================================================
-- MATRIZ DE ACCESO (decisión de esta migración, sin nueva arquitectura):
--
-- 6 tablas nuevas — dos grupos según quién ejecuta la escritura real:
--
-- (a) "Calculadas / gestionadas por servicio" — el estudiante NUNCA escribe
--     directamente (mismo patrón ya usado para `student_dashboard`, cuya
--     escritura es exclusiva de dashboard_service_role pese a ser "datos
--     del propio estudiante"): learning_goal, learning_phase. Su `status`
--     se calcula automáticamente a partir de sus hijas (18.21) — GRANT de
--     escritura únicamente para dashboard_service_role.
--
-- (b) "Escritura directa del estudiante" (con service_role también capaz,
--     para los casos de creación/eventos externos): learning_objective,
--     learning_task, study_schedule, study_session. El estudiante actualiza
--     estas tablas dentro de su propio contexto (withStudentContext), nunca
--     crea learning_task/learning_objective/study_schedule (esas filas las
--     crea el servicio de creación/reprogramación de planes) — por eso
--     dashboard_app_role recibe UPDATE pero no INSERT en esas 3, y sí
--     INSERT+UPDATE en study_session (registrar sesiones de estudio es una
--     acción directa del estudiante, 13.4/CU-06).
--
-- learning_task añade además una restricción a nivel de fila que el propio
-- documento consolidado exige (18.21): un estudiante solo puede escribir
-- una learning_task si `source = SELF_DIRECTED` — se aplica tanto en USING
-- (qué filas puede tocar) como en WITH CHECK (qué valor final es válido),
-- de modo que ni siquiera puede "convertir" una tarea externa en propia.
--
-- Ninguna tabla recibe GRANT de DELETE para ningún rol (18.20.7: las
-- entidades de un plan nunca se eliminan, solo se archivan implícitamente
-- vía el status del LearningPlan padre).
--
-- Adicionalmente, esta migración corrige un vacío real de la migración
-- 202607170900: dashboard_service_role nunca recibió GRANT de escritura
-- sobre learning_plan/daily_plan/weekly_plan/learning_progress (solo
-- existía sobre "user" y "student_dashboard") — sin ese GRANT, ningún
-- servicio (ni el de creación de planes, ni el de reprogramación) podría
-- escribir en esas 4 tablas ya existentes. Se añade aquí SELECT, INSERT,
-- UPDATE (no solo INSERT/UPDATE: un UPDATE con WHERE/RETURNING exige
-- también SELECT, confirmado empíricamente durante la verificación PGlite
-- de este sprint), sin tocar sus políticas de lectura ya auditadas ni sus
-- columnas.
-- ============================================================================

-- ============================ learning_goal =================================

ALTER TABLE "learning_goal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_goal" FORCE ROW LEVEL SECURITY;

CREATE POLICY "learning_goal_self_access" ON "learning_goal"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "learning_plan" lp
      WHERE lp."id" = "learning_goal"."learning_plan_id"
        AND lp."student_id" = current_student_id()
    )
  );

CREATE POLICY "learning_goal_service_write" ON "learning_goal"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

-- ========================= learning_objective ================================
-- Ownership a dos niveles: learning_objective -> learning_goal -> learning_plan.

ALTER TABLE "learning_objective" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_objective" FORCE ROW LEVEL SECURITY;

CREATE POLICY "learning_objective_self_access" ON "learning_objective"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "learning_goal" lg
      JOIN "learning_plan" lp ON lp."id" = lg."learning_plan_id"
      WHERE lg."id" = "learning_objective"."learning_goal_id"
        AND lp."student_id" = current_student_id()
    )
  );

-- Escritura directa del estudiante: LearningObjective siempre se completa
-- manualmente (18.21, no tiene campo `source`).
CREATE POLICY "learning_objective_self_update" ON "learning_objective"
  FOR UPDATE TO dashboard_app_role
  USING (
    EXISTS (
      SELECT 1 FROM "learning_goal" lg
      JOIN "learning_plan" lp ON lp."id" = lg."learning_plan_id"
      WHERE lg."id" = "learning_objective"."learning_goal_id"
        AND lp."student_id" = current_student_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "learning_goal" lg
      JOIN "learning_plan" lp ON lp."id" = lg."learning_plan_id"
      WHERE lg."id" = "learning_objective"."learning_goal_id"
        AND lp."student_id" = current_student_id()
    )
  );

CREATE POLICY "learning_objective_service_write" ON "learning_objective"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

-- ============================ learning_phase =================================

ALTER TABLE "learning_phase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_phase" FORCE ROW LEVEL SECURITY;

CREATE POLICY "learning_phase_self_access" ON "learning_phase"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "learning_plan" lp
      WHERE lp."id" = "learning_phase"."learning_plan_id"
        AND lp."student_id" = current_student_id()
    )
  );

CREATE POLICY "learning_phase_service_write" ON "learning_phase"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

-- ============================= learning_task ==================================
-- Ownership a dos niveles: learning_task -> learning_phase -> learning_plan.
-- Restricción adicional por fila (18.21): el estudiante solo puede escribir
-- si source = SELF_DIRECTED, exigido tanto en USING como en WITH CHECK.

ALTER TABLE "learning_task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_task" FORCE ROW LEVEL SECURITY;

CREATE POLICY "learning_task_self_access" ON "learning_task"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "learning_phase" lph
      JOIN "learning_plan" lp ON lp."id" = lph."learning_plan_id"
      WHERE lph."id" = "learning_task"."learning_phase_id"
        AND lp."student_id" = current_student_id()
    )
  );

CREATE POLICY "learning_task_self_update" ON "learning_task"
  FOR UPDATE TO dashboard_app_role
  USING (
    "learning_task"."source" = 'SELF_DIRECTED'
    AND EXISTS (
      SELECT 1 FROM "learning_phase" lph
      JOIN "learning_plan" lp ON lp."id" = lph."learning_plan_id"
      WHERE lph."id" = "learning_task"."learning_phase_id"
        AND lp."student_id" = current_student_id()
    )
  )
  WITH CHECK (
    "source" = 'SELF_DIRECTED'
    AND EXISTS (
      SELECT 1 FROM "learning_phase" lph
      JOIN "learning_plan" lp ON lp."id" = lph."learning_plan_id"
      WHERE lph."id" = "learning_task"."learning_phase_id"
        AND lp."student_id" = current_student_id()
    )
  );

CREATE POLICY "learning_task_service_write" ON "learning_task"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

-- ============================ study_schedule ==================================

ALTER TABLE "study_schedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "study_schedule" FORCE ROW LEVEL SECURITY;

CREATE POLICY "study_schedule_self_access" ON "study_schedule"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "learning_plan" lp
      WHERE lp."id" = "study_schedule"."learning_plan_id"
        AND lp."student_id" = current_student_id()
    )
  );

CREATE POLICY "study_schedule_self_update" ON "study_schedule"
  FOR UPDATE TO dashboard_app_role
  USING (
    EXISTS (
      SELECT 1 FROM "learning_plan" lp
      WHERE lp."id" = "study_schedule"."learning_plan_id"
        AND lp."student_id" = current_student_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "learning_plan" lp
      WHERE lp."id" = "study_schedule"."learning_plan_id"
        AND lp."student_id" = current_student_id()
    )
  );

CREATE POLICY "study_schedule_service_write" ON "study_schedule"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

-- ============================= study_session ===================================
-- Única de las 6 con student_id propio — política directa, sin subconsulta.

ALTER TABLE "study_session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "study_session" FORCE ROW LEVEL SECURITY;

CREATE POLICY "study_session_self_access" ON "study_session"
  FOR SELECT USING ("student_id" = current_student_id());

CREATE POLICY "study_session_self_insert" ON "study_session"
  FOR INSERT TO dashboard_app_role
  WITH CHECK ("student_id" = current_student_id());

CREATE POLICY "study_session_self_update" ON "study_session"
  FOR UPDATE TO dashboard_app_role
  USING ("student_id" = current_student_id())
  WITH CHECK ("student_id" = current_student_id());

CREATE POLICY "study_session_service_write" ON "study_session"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- Privilegios de nivel de tabla (GRANT) — RLS nunca sustituye al GRANT.
-- ============================================================================

-- dashboard_app_role: lectura en las 6 tablas nuevas.
GRANT SELECT ON
  "learning_goal", "learning_objective", "learning_phase",
  "learning_task", "study_schedule", "study_session"
TO dashboard_app_role;

-- dashboard_app_role: escritura directa solo donde el estudiante actúa en
-- primera persona (nunca crea learning_objective/learning_task/
-- study_schedule -- esas filas las crea el servicio de planes; sí crea y
-- actualiza sus propias study_session).
GRANT UPDATE ON "learning_objective", "learning_task", "study_schedule" TO dashboard_app_role;
GRANT INSERT, UPDATE ON "study_session" TO dashboard_app_role;

-- dashboard_service_role: lectura y escritura completas (sin DELETE) sobre
-- las 6 tablas nuevas -- crea y recalcula todo lo que el estudiante no
-- escribe directamente (planes, metas, fases, y las tareas no SELF_DIRECTED
-- vía el evento EXTERNAL_ACTIVITY_COMPLETED).
GRANT SELECT, INSERT, UPDATE ON
  "learning_goal", "learning_objective", "learning_phase",
  "learning_task", "study_schedule", "study_session"
TO dashboard_service_role;

-- Corrección de vacío real de 202607170900 (ver cabecera de este archivo):
-- dashboard_service_role nunca tuvo GRANT de escritura sobre las 4 tablas
-- de Mi Plan ya existentes -- sin este GRANT, ningún servicio podría
-- persistir la creación/recalculo de un plan. Se incluye también SELECT:
-- un UPDATE con cláusula WHERE (y opcionalmente RETURNING) requiere
-- privilegio SELECT sobre la tabla además de UPDATE -- sin él, Postgres
-- devuelve "permission denied" incluso teniendo BYPASSRLS (BYPASSRLS exime
-- de las políticas de fila, nunca de los GRANT de tabla), confirmado
-- empíricamente durante la verificación PGlite de este sprint.
GRANT SELECT, INSERT, UPDATE ON "learning_plan", "daily_plan", "weekly_plan", "learning_progress" TO dashboard_service_role;
