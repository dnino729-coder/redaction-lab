-- ACADEMIA — RLS (Sprint 6.2). Reutiliza dashboard_app_role/dashboard_service_role
-- y current_student_id() ya creados por 202607170900_dashboard_rls_policies.
-- No crea ningún rol nuevo. model_example y academy_outbox: sin RLS
-- (contenido editorial compartido / infraestructura pura de servicio).

ALTER TABLE "academy_unit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "academy_unit" FORCE ROW LEVEL SECURITY;
CREATE POLICY "academy_unit_self_access" ON "academy_unit"
  FOR SELECT USING ("student_id" = current_student_id());
CREATE POLICY "academy_unit_service_write" ON "academy_unit"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

ALTER TABLE "attempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attempt" FORCE ROW LEVEL SECURITY;
CREATE POLICY "attempt_self_access" ON "attempt"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "academy_unit" au WHERE au."id" = "attempt"."academy_unit_id" AND au."student_id" = current_student_id())
  );
CREATE POLICY "attempt_self_write" ON "attempt"
  FOR ALL TO dashboard_app_role USING (
    EXISTS (SELECT 1 FROM "academy_unit" au WHERE au."id" = "attempt"."academy_unit_id" AND au."student_id" = current_student_id())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM "academy_unit" au WHERE au."id" = "attempt"."academy_unit_id" AND au."student_id" = current_student_id())
  );
CREATE POLICY "attempt_service_write" ON "attempt"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

ALTER TABLE "draft" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "draft" FORCE ROW LEVEL SECURITY;
CREATE POLICY "draft_self_access" ON "draft"
  FOR ALL TO dashboard_app_role USING (
    EXISTS (SELECT 1 FROM "attempt" a JOIN "academy_unit" au ON au."id" = a."academy_unit_id" WHERE a."id" = "draft"."attempt_id" AND au."student_id" = current_student_id())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM "attempt" a JOIN "academy_unit" au ON au."id" = a."academy_unit_id" WHERE a."id" = "draft"."attempt_id" AND au."student_id" = current_student_id())
  );
CREATE POLICY "draft_service_write" ON "draft"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

ALTER TABLE "version" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "version" FORCE ROW LEVEL SECURITY;
CREATE POLICY "version_self_access" ON "version"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "attempt" a JOIN "academy_unit" au ON au."id" = a."academy_unit_id" WHERE a."id" = "version"."attempt_id" AND au."student_id" = current_student_id())
  );
CREATE POLICY "version_service_write" ON "version"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

ALTER TABLE "feedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "feedback" FORCE ROW LEVEL SECURITY;
CREATE POLICY "feedback_self_access" ON "feedback"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "version" v JOIN "attempt" a ON a."id" = v."attempt_id" JOIN "academy_unit" au ON au."id" = a."academy_unit_id"
      WHERE v."id" = "feedback"."version_id" AND au."student_id" = current_student_id()
    )
  );
CREATE POLICY "feedback_service_write" ON "feedback"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

ALTER TABLE "feedback_observation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "feedback_observation" FORCE ROW LEVEL SECURITY;
CREATE POLICY "feedback_observation_self_access" ON "feedback_observation"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "feedback" f JOIN "version" v ON v."id" = f."version_id" JOIN "attempt" a ON a."id" = v."attempt_id" JOIN "academy_unit" au ON au."id" = a."academy_unit_id"
      WHERE f."id" = "feedback_observation"."feedback_id" AND au."student_id" = current_student_id()
    )
  );
CREATE POLICY "feedback_observation_service_write" ON "feedback_observation"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

ALTER TABLE "teacher_override" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teacher_override" FORCE ROW LEVEL SECURITY;
CREATE POLICY "teacher_override_self_access" ON "teacher_override"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "academy_unit" au WHERE au."id" = "teacher_override"."academy_unit_id" AND au."student_id" = current_student_id())
  );
CREATE POLICY "teacher_override_service_write" ON "teacher_override"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

ALTER TABLE "teacher_recommendation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teacher_recommendation" FORCE ROW LEVEL SECURITY;
CREATE POLICY "teacher_recommendation_self_access" ON "teacher_recommendation"
  FOR SELECT USING ("student_id" = current_student_id());
CREATE POLICY "teacher_recommendation_service_write" ON "teacher_recommendation"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

-- model_example / academy_outbox: sin RLS (ver nota de cabecera).
