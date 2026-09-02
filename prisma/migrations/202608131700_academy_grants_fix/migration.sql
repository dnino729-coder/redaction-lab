-- ACADEMIA — corrección de GRANT ausente (bloqueante confirmado en runtime,
-- Postgres 42501 "permission denied for table academy_unit").
--
-- 202607211600_academy_rls_policies ya está aplicada/Frozen y no se edita in
-- place (misma regla de nomenclatura ya usada en el proyecto: todo cambio
-- posterior sube de versión / es una migración nueva) — esta migración solo
-- añade los GRANT que esa migración omitió. No crea roles, no crea
-- políticas, no toca RLS: BYPASSRLS exime de las políticas de fila, nunca de
-- los GRANT de nivel de tabla (mismo patrón ya corregido en
-- 202607170900_dashboard_rls_policies y 202607171400_my_plan_rls_policies).

-- dashboard_service_role (BYPASSRLS) — necesita CRUD completo sobre las 8
-- tablas de Academia para que sus políticas "FOR ALL ... USING (true)"
-- (202607211600) sean alcanzables.
GRANT SELECT, INSERT, UPDATE, DELETE ON
  "academy_unit",
  "attempt",
  "draft",
  "version",
  "feedback",
  "feedback_observation",
  "teacher_override",
  "teacher_recommendation"
  TO dashboard_service_role;

-- dashboard_app_role — necesita lectura/escritura propia del estudiante
-- sobre "attempt" y "draft" (políticas "attempt_self_write"/"draft_self_access",
-- 202607211600), sin GRANT también bloqueadas por el mismo motivo.
GRANT SELECT, INSERT, UPDATE ON "attempt", "draft" TO dashboard_app_role;
