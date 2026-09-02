-- ACADEMIA — corrección: "model_example" (catálogo de textos modelo,
-- compartido, sin RLS por diseño — ver 202607211600_academy_rls_policies)
-- nunca recibió GRANT de tabla para ningún rol. Las lecturas de
-- PrismaAcademyReadModelPort.listModelExamplesByTextType corren bajo
-- dashboard_service_role (withActiveClient → withServiceContext, sin
-- transacción activa de UnitOfWork en el camino de Query Handlers) y
-- fallan con "permission denied for table model_example" (Postgres
-- 42501) — mismo patrón de bloqueo ya corregido para academy_unit y
-- teacher_override. No habilita RLS (permanece deshabilitada,
-- intencionalmente, por ser contenido editorial compartido, no propiedad
-- de un estudiante). No modifica ninguna migración anterior.

GRANT SELECT ON "model_example" TO dashboard_service_role;
