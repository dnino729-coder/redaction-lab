-- Row Level Security — módulo Dashboard.
-- Regla MUST (sección 5.5, reforzada como criterio de aceptación en
-- docs/modules/dashboard.md, sección 16): "el estudiante solo podrá acceder
-- a su propia información". Aplica a todas las tablas de solo lectura
-- consultadas por el Dashboard Service, más su propia tabla `student_dashboard`.
--
-- Autenticación: Clerk (resolución 18.1), NO Supabase Auth — por lo tanto
-- estas políticas NO usan `auth.uid()` (función propia de Supabase Auth,
-- vacía en este proyecto, ya que la identidad no la gestiona Supabase). En
-- su lugar, cada transacción de lectura fija una variable de sesión Postgres
-- con el id (UUID interno) del estudiante autenticado antes de ejecutar
-- cualquier consulta — ver `database/repositories/withStudentContext.ts`.
--
-- Se aplica INMEDIATAMENTE DESPUÉS de la migración
-- `202607161000_dashboard_read_schema` (que crea las tablas) — antes vivía
-- como un script manual separado (`docs/database/rls-policies.sql`), fuera
-- del flujo de `prisma migrate deploy`; se integra aquí como migración
-- versionada para que su aplicación sea automática y determinista en todo
-- entorno (Development/Testing/Staging/Production, 13.14), en vez de
-- depender de que un operador recuerde ejecutar un script aparte — hallazgo
-- de la auditoría de producción: el pipeline de CI nunca lo aplicaba.
--
-- ============================================================================
-- CORRECCIONES DE ESTA MIGRACIÓN respecto a la versión anterior del script
-- manual (auditoría de producción, bloqueantes críticos resueltos):
--
-- 1. GRANT ampliado a dashboard_service_role: la versión anterior solo
--    otorgaba privilegios sobre `student_dashboard`, pero
--    `queryStudentIdByClerkId`/`upsertUserFromClerk`/`deactivateUserByClerkId`
--    (database/queries/user.ts) siempre necesitaron SELECT/INSERT/UPDATE
--    sobre `"user"` bajo este mismo rol — BYPASSRLS exime de las políticas de
--    fila, pero NUNCA de los GRANT de nivel de tabla, que son un mecanismo
--    independiente en Postgres. Sin este GRANT, la resolución de identidad
--    Clerk→estudiante fallaba con "permission denied for table user" en
--    cuanto esta política se aplicara tal cual estaba escrita.
-- 2. GRANT a CURRENT_USER en vez de un placeholder literal sin sustituir
--    (`<db_connection_role>`): la versión anterior no era ejecutable tal
--    cual. `CURRENT_USER` en el momento de aplicar esta migración es,
--    salvo configuración atípica, el mismo rol con el que `prisma migrate
--    deploy` se ejecuta — que en un despliegue estándar de este proyecto es
--    el mismo rol que Prisma usa en tiempo de ejecución (`DATABASE_URL`).
--    Si en el futuro se separa el rol de migraciones del rol de ejecución
--    de la aplicación, ejecutar manualmente una vez:
--      GRANT dashboard_app_role, dashboard_service_role TO <rol_de_conexión_real>;
-- 3. FORCE ROW LEVEL SECURITY añadido a cada tabla (antes solo ENABLE): por
--    defecto, Postgres exime al propietario de una tabla de sus propias
--    políticas RLS aunque estén ENABLE — solo FORCE hace que ni siquiera el
--    propietario quede exento (los superusuarios siempre quedan exentos,
--    con o sin FORCE; eso no se puede desactivar). Defensa en profundidad
--    para el caso en que alguien ejecute una consulta manual como el rol
--    propietario de las tablas sin pasar por dashboard_app_role.
-- 4. GRANT USAGE ON SCHEMA public añadido explícitamente: no se asume que
--    el esquema `public` tenga privilegios de uso abiertos a PUBLIC (varias
--    configuraciones gestionadas de Postgres, incluido Supabase en
--    proyectos recientes, los revocan por defecto) — sin este GRANT, incluso
--    con las políticas y los GRANT de tabla correctos, dashboard_app_role/
--    dashboard_service_role no podrían ni siquiera ver las tablas del
--    esquema.
-- 5. Corrección simétrica en código (no en este archivo, ver
--    database/repositories/withStudentContext.ts): `withStudentContext`
--    ahora ejecuta `SET LOCAL ROLE dashboard_app_role` antes de fijar
--    `app.current_student_id` — sin ese cambio de rol, ninguna política de
--    esta migración se llegaba a evaluar para las lecturas del Dashboard,
--    sin importar cuán completo estuviera este script.
-- ============================================================================

-- Rol de aplicación (sin BYPASSRLS) — usado por Prisma en el contexto de
-- una petición autenticada de un estudiante (withStudentContext).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dashboard_app_role') THEN
    CREATE ROLE dashboard_app_role NOLOGIN NOBYPASSRLS;
  END IF;
END
$$;

-- Rol de servicio (con BYPASSRLS) — usado ÚNICAMENTE para operaciones
-- servidor-a-servidor sin sesión de estudiante todavía resuelta: resolución
-- de identidad Clerk→estudiante, aprovisionamiento/sincronización de
-- `User` desde el webhook de Clerk, y la escritura del consolidado
-- `student_dashboard` — nunca para servir una petición HTTP de un
-- estudiante ya autenticado (docs/modules/dashboard.md, sección 10).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dashboard_service_role') THEN
    CREATE ROLE dashboard_service_role NOLOGIN BYPASSRLS;
  END IF;
END
$$;

-- Corrección 4: privilegio de uso del esquema, explícito y no asumido.
GRANT USAGE ON SCHEMA public TO dashboard_app_role, dashboard_service_role;

-- Función auxiliar: UUID del estudiante autenticado en la sesión actual,
-- fijado por `SET LOCAL app.current_student_id`. Devuelve NULL si no se
-- fijó (las políticas rechazan por defecto, no exponen datos por omisión).
CREATE OR REPLACE FUNCTION current_student_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_student_id', true), '')::UUID;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- Tablas cuya clave de propiedad es `student_id` (o `user_id`/`attempt_id`/
-- `submission_id`/`student_competency_id`/`learning_plan_id` indirectos,
-- resueltos con una subconsulta hacia la tabla propietaria).
-- ============================================================================

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user" FORCE ROW LEVEL SECURITY;
CREATE POLICY "user_self_access" ON "user"
  FOR SELECT USING ("id" = current_student_id());

ALTER TABLE "student_profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_profile" FORCE ROW LEVEL SECURITY;
CREATE POLICY "student_profile_self_access" ON "student_profile"
  FOR SELECT USING ("user_id" = current_student_id());

ALTER TABLE "learning_plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_plan" FORCE ROW LEVEL SECURITY;
CREATE POLICY "learning_plan_self_access" ON "learning_plan"
  FOR SELECT USING ("student_id" = current_student_id());

ALTER TABLE "daily_plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_plan" FORCE ROW LEVEL SECURITY;
CREATE POLICY "daily_plan_self_access" ON "daily_plan"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "learning_plan" lp
      WHERE lp."id" = "daily_plan"."learning_plan_id"
        AND lp."student_id" = current_student_id()
    )
  );

ALTER TABLE "weekly_plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "weekly_plan" FORCE ROW LEVEL SECURITY;
CREATE POLICY "weekly_plan_self_access" ON "weekly_plan"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "learning_plan" lp
      WHERE lp."id" = "weekly_plan"."learning_plan_id"
        AND lp."student_id" = current_student_id()
    )
  );

ALTER TABLE "learning_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_progress" FORCE ROW LEVEL SECURITY;
CREATE POLICY "learning_progress_self_access" ON "learning_progress"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "learning_plan" lp
      WHERE lp."id" = "learning_progress"."learning_plan_id"
        AND lp."student_id" = current_student_id()
    )
  );

ALTER TABLE "writing_submission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "writing_submission" FORCE ROW LEVEL SECURITY;
CREATE POLICY "writing_submission_self_access" ON "writing_submission"
  FOR SELECT USING ("student_id" = current_student_id());

ALTER TABLE "writing_draft" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "writing_draft" FORCE ROW LEVEL SECURITY;
CREATE POLICY "writing_draft_self_access" ON "writing_draft"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "writing_submission" ws
      WHERE ws."id" = "writing_draft"."submission_id"
        AND ws."student_id" = current_student_id()
    )
  );

ALTER TABLE "exam_attempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exam_attempt" FORCE ROW LEVEL SECURITY;
CREATE POLICY "exam_attempt_self_access" ON "exam_attempt"
  FOR SELECT USING ("student_id" = current_student_id());

ALTER TABLE "evaluation_result" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "evaluation_result" FORCE ROW LEVEL SECURITY;
CREATE POLICY "evaluation_result_self_access" ON "evaluation_result"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "exam_attempt" ea
      WHERE ea."id" = "evaluation_result"."attempt_id"
        AND ea."student_id" = current_student_id()
    )
  );

ALTER TABLE "coach_recommendation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coach_recommendation" FORCE ROW LEVEL SECURITY;
CREATE POLICY "coach_recommendation_self_access" ON "coach_recommendation"
  FOR SELECT USING ("student_id" = current_student_id());

ALTER TABLE "coach_context" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coach_context" FORCE ROW LEVEL SECURITY;
CREATE POLICY "coach_context_self_access" ON "coach_context"
  FOR SELECT USING ("student_id" = current_student_id());

-- `competency` es un catálogo compartido (nombres de competencias), no datos
-- personales de un estudiante — se habilita RLS por consistencia (defensa en
-- profundidad) pero la política permite lectura a cualquier sesión con
-- `current_student_id()` fijado (cualquier estudiante autenticado), sin
-- filtrar por fila.
ALTER TABLE "competency" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "competency" FORCE ROW LEVEL SECURITY;
CREATE POLICY "competency_authenticated_read" ON "competency"
  FOR SELECT USING (current_student_id() IS NOT NULL);

ALTER TABLE "student_competency" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_competency" FORCE ROW LEVEL SECURITY;
CREATE POLICY "student_competency_self_access" ON "student_competency"
  FOR SELECT USING ("student_id" = current_student_id());

ALTER TABLE "competency_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "competency_progress" FORCE ROW LEVEL SECURITY;
CREATE POLICY "competency_progress_self_access" ON "competency_progress"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "student_competency" sc
      WHERE sc."id" = "competency_progress"."student_competency_id"
        AND sc."student_id" = current_student_id()
    )
  );

ALTER TABLE "learning_metric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_metric" FORCE ROW LEVEL SECURITY;
CREATE POLICY "learning_metric_self_access" ON "learning_metric"
  FOR SELECT USING ("student_id" = current_student_id());

ALTER TABLE "performance_metric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "performance_metric" FORCE ROW LEVEL SECURITY;
CREATE POLICY "performance_metric_self_access" ON "performance_metric"
  FOR SELECT USING ("student_id" = current_student_id());

ALTER TABLE "learning_analytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_analytics" FORCE ROW LEVEL SECURITY;
CREATE POLICY "learning_analytics_self_access" ON "learning_analytics"
  FOR SELECT USING ("student_id" = current_student_id());

ALTER TABLE "streak" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "streak" FORCE ROW LEVEL SECURITY;
CREATE POLICY "streak_self_access" ON "streak"
  FOR SELECT USING ("student_id" = current_student_id());

ALTER TABLE "student_level" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_level" FORCE ROW LEVEL SECURITY;
CREATE POLICY "student_level_self_access" ON "student_level"
  FOR SELECT USING ("student_id" = current_student_id());

ALTER TABLE "xp_transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "xp_transaction" FORCE ROW LEVEL SECURITY;
CREATE POLICY "xp_transaction_self_access" ON "xp_transaction"
  FOR SELECT USING ("student_id" = current_student_id());

-- ============================================================================
-- student_dashboard: única tabla del módulo con escritura. El estudiante
-- puede leer su propio consolidado; solo el rol de servicio (procesos
-- programados de refresco, 15.1) puede escribir en ella.
-- ============================================================================

ALTER TABLE "student_dashboard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_dashboard" FORCE ROW LEVEL SECURITY;

CREATE POLICY "student_dashboard_self_read" ON "student_dashboard"
  FOR SELECT USING ("student_id" = current_student_id());

CREATE POLICY "student_dashboard_service_write" ON "student_dashboard"
  FOR ALL TO dashboard_service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- Privilegios de nivel de tabla (requisito de Postgres además de las
-- políticas de fila: RLS nunca sustituye al GRANT, lo complementa).
-- ============================================================================

-- dashboard_app_role: SELECT sobre todas las tablas que el Dashboard lee,
-- restringido por fila mediante las políticas ya creadas arriba.
GRANT SELECT ON
  "user", "student_profile", "learning_plan", "daily_plan", "weekly_plan",
  "learning_progress", "writing_submission", "writing_draft", "exam_attempt",
  "evaluation_result", "coach_recommendation", "coach_context", "competency",
  "student_competency", "competency_progress", "learning_metric",
  "performance_metric", "learning_analytics", "streak", "student_level",
  "xp_transaction", "student_dashboard"
TO dashboard_app_role;

-- dashboard_service_role: escritura del consolidado del Dashboard...
GRANT INSERT, UPDATE, SELECT ON "student_dashboard" TO dashboard_service_role;

-- ...y (corrección 1, bloqueante crítico) SELECT/INSERT/UPDATE sobre "user"
-- para la resolución de identidad Clerk→estudiante
-- (database/queries/user.ts, queryStudentIdByClerkId) y el aprovisionamiento
-- de usuario desde el webhook de Clerk
-- (upsertUserFromClerk/deactivateUserByClerkId) — ambos se ejecutan bajo
-- este rol porque el studentId interno aún no existe o no se conoce en ese
-- punto (12.3/12.4). Sin este GRANT, ambos flujos fallan con "permission
-- denied for table user" pese a que dashboard_service_role tiene BYPASSRLS
-- (BYPASSRLS exime de las políticas de fila, nunca de los GRANT de tabla).
GRANT SELECT, INSERT, UPDATE ON "user" TO dashboard_service_role;

-- Corrección 2 (bloqueante crítico): prerrequisito para `withServiceContext`
-- y ahora también para `withStudentContext`
-- (database/repositories/withStudentContext.ts) — el rol con el que se
-- ejecuta esta migración (CURRENT_USER) debe tener membresía en ambos roles
-- para poder alternar entre ellos con `SET LOCAL ROLE` dentro de una misma
-- conexión. Ver la nota 2 al inicio de este archivo sobre el supuesto de que
-- el rol de migración coincide con el rol de ejecución de la aplicación.
GRANT dashboard_app_role, dashboard_service_role TO CURRENT_USER;
