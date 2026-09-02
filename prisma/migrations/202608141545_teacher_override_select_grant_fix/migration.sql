-- ACADEMIA — corrección: PrismaAcademyUnitRepository.findAllByStudentId
-- (usada por la comprobación de idempotencia de
-- ProvisionAcademyUnitsForStudentHandler) incluye siempre
-- `teacherOverrides` (UNIT_INCLUDE, include plano sin relaciones
-- adicionales). Esa lectura corre bajo dashboard_app_role
-- (withStudentContext), igual que academy_unit. La política
-- "teacher_override_self_access" (SELECT, sin TO — aplica a cualquier
-- rol, 202607211600_academy_rls_policies) ya cubre esta lectura por RLS;
-- solo faltaba el GRANT de tabla. No crea políticas nuevas, no modifica
-- 202607211600_academy_rls_policies, 202608131700_academy_grants_fix,
-- 202608141500_academy_unit_provisioning_grants ni
-- 202608141530_academy_unit_select_grant_fix.

GRANT SELECT ON "teacher_override" TO dashboard_app_role;
