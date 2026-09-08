-- student_profile ya tenía RLS habilitado y una política de SELECT
-- (202607170900_dashboard_rls_policies) desde que Dashboard creó la
-- tabla, pero nunca recibió política de escritura ni GRANT de INSERT/
-- UPDATE para ningún rol (confirmado empíricamente: dashboard_service_role
-- ni siquiera tiene SELECT sobre esta tabla). Esta migración habilita
-- ÚNICAMENTE lo necesario para el onboarding de perfil: un estudiante
-- puede crear y actualizar su propio StudentProfile, nunca el de otro
-- (misma condición que current_student_id() ya usa en el resto del
-- proyecto), y nunca puede borrarlo (sin política ni GRANT de DELETE).

CREATE POLICY "student_profile_self_insert" ON "student_profile"
  FOR INSERT TO dashboard_app_role
  WITH CHECK ("user_id" = current_student_id());

CREATE POLICY "student_profile_self_update" ON "student_profile"
  FOR UPDATE TO dashboard_app_role
  USING ("user_id" = current_student_id())
  WITH CHECK ("user_id" = current_student_id());

GRANT INSERT, UPDATE ON "student_profile" TO dashboard_app_role;
