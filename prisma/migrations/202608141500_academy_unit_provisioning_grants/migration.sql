-- ACADEMIA — permisos mínimos para que dashboard_app_role pueda provisionar
-- (INSERT) y actualizar sus propias filas de "academy_unit" bajo
-- withStudentContext. No modifica 202607211600_academy_rls_policies ni
-- 202608131700_academy_grants_fix (ambas Frozen) — solo añade lo que
-- faltaba, mismo patrón ya usado por 202608131700_academy_grants_fix
-- respecto a 202607211600_academy_rls_policies.
--
-- Motivo: ProvisionAcademyUnitsForStudentHandler (CMD-15) llama siempre a
-- PrismaAcademyUnitRepository.save(), que ejecuta
-- academyUnit.upsert({ create, update }) — Postgres planifica la rama
-- ON CONFLICT DO UPDATE de un upsert incluso en la primera inserción, así
-- que además de la política/GRANT de INSERT hace falta también la de
-- UPDATE para que el upsert no falle por permisos, aunque en este flujo
-- concreto (unidades nuevas) la rama UPDATE nunca llegue a ejecutarse. No
-- se otorga SELECT ni DELETE: no son necesarios para esta operación (el
-- estudiante nunca borra sus propias unidades, y la lectura de
-- "academy_unit" sigue sirviéndose bajo dashboard_service_role, sin
-- cambios).
--
-- FORCE ROW LEVEL SECURITY ya está activo desde 202607211600 y se
-- mantiene sin alteraciones (no se re-declara aquí).

CREATE POLICY "academy_unit_self_insert" ON "academy_unit"
  FOR INSERT TO dashboard_app_role
  WITH CHECK ("student_id" = current_student_id());

CREATE POLICY "academy_unit_self_update" ON "academy_unit"
  FOR UPDATE TO dashboard_app_role
  USING ("student_id" = current_student_id())
  WITH CHECK ("student_id" = current_student_id());

GRANT INSERT, UPDATE ON "academy_unit" TO dashboard_app_role;
