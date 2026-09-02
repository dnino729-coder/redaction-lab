-- ACADEMIA — corrección: la comprobación de idempotencia interna de
-- ProvisionAcademyUnitsForStudentHandler (findAllByStudentId) se ejecuta
-- dentro de la misma transacción withStudentContext que el INSERT, es
-- decir bajo dashboard_app_role, no dashboard_service_role. La política
-- "academy_unit_self_access" (SELECT, sin TO — aplica a cualquier rol,
-- 202607211600_academy_rls_policies) ya cubre esta lectura por RLS; solo
-- faltaba el GRANT de tabla. No crea políticas nuevas, no modifica
-- 202607211600_academy_rls_policies, 202608131700_academy_grants_fix ni
-- 202608141500_academy_unit_provisioning_grants.

GRANT SELECT ON "academy_unit" TO dashboard_app_role;
