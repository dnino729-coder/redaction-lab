# Migración `202607170900_dashboard_rls_policies`

**Módulo funcional:** Dashboard (única responsabilidad de esta migración — 13.14: "cada migración deberá modificar únicamente un módulo funcional").

**Origen:** corrección de bloqueantes críticos de producción detectados en la auditoría técnica del módulo Dashboard (autenticación, RLS y permisos de base de datos). Reemplaza al script manual `docs/database/rls-policies.sql` (ver ese archivo para el detalle histórico) — se integra aquí como migración versionada para que `prisma migrate deploy` la aplique automáticamente en todo entorno, en vez de depender de un paso manual que el pipeline de CI nunca ejecutaba.

**Depende de:** `202607161000_dashboard_read_schema` (crea las tablas sobre las que esta migración habilita RLS).

## Qué crea

- Roles `dashboard_app_role` (sin `BYPASSRLS`, usado por `withStudentContext`) y `dashboard_service_role` (con `BYPASSRLS`, usado por `withServiceContext`).
- Función `current_student_id()`.
- `ENABLE`/`FORCE ROW LEVEL SECURITY` + una política `SELECT` por tabla en las ~20 tablas de lectura del Dashboard, más las dos políticas de `student_dashboard` (lectura propia / escritura de servicio).
- `GRANT USAGE ON SCHEMA public`, `GRANT SELECT` a `dashboard_app_role` sobre todas las tablas, `GRANT SELECT/INSERT/UPDATE` a `dashboard_service_role` sobre `"user"` y `"student_dashboard"`, y `GRANT` de membresía de ambos roles a `CURRENT_USER`.

## Bloqueantes críticos que corrige (auditoría de producción)

1. **`GRANT` incompleto sobre `"user"` para `dashboard_service_role`** — rompía `findStudentIdByClerkId`, el puente Clerk→estudiante que usa cada carga del Dashboard. Corregido con `GRANT SELECT, INSERT, UPDATE ON "user" TO dashboard_service_role`.
2. **Placeholder `<db_connection_role>` sin sustituir** — el script anterior no era ejecutable. Corregido con `GRANT ... TO CURRENT_USER`, autoconfigurado en el momento de aplicar la migración (ver comentario extenso en `migration.sql`).
3. **`FORCE ROW LEVEL SECURITY` ausente** — sin él, el propietario de las tablas queda exento de sus propias políticas RLS por defecto en Postgres. Añadido a las ~21 tablas.
4. **`GRANT USAGE ON SCHEMA public` ausente** — no se asumía como concedido por defecto (varias configuraciones de Postgres gestionado, incluido Supabase, lo revocan). Añadido explícitamente.
5. **Corrección de código asociada (fuera de este archivo, ver `database/repositories/withStudentContext.ts`):** `withStudentContext` no cambiaba de rol antes de fijar `app.current_student_id` — sin `SET LOCAL ROLE dashboard_app_role`, ninguna política RLS de esta migración llegaba a evaluarse para las lecturas del Dashboard, sin importar cuán completo estuviera el script SQL. Este es el hallazgo más severo de la auditoría de remediación: si el rol de conexión de Prisma (`DATABASE_URL`) es el propietario de las tablas o un superusuario (caso por defecto de Supabase, rol `postgres`), Postgres ignora RLS por completo para ese rol.

## Cómo aplicar

```bash
npx prisma migrate deploy
```

Ya no requiere ningún paso manual adicional — antes era necesario aplicar `docs/database/rls-policies.sql` "inmediatamente después" de la migración de esquema como un paso separado, fácil de olvidar (y de hecho, nunca aplicado por `.github/workflows/ci.yml`, hallazgo cerrado en esta misma corrección — ver ese archivo).

## Riesgo residual documentado

`GRANT ... TO CURRENT_USER` asume que el rol que ejecuta `prisma migrate deploy` es el mismo rol (o tiene la misma membresía efectiva) que el rol de `DATABASE_URL` en tiempo de ejecución de la aplicación — supuesto válido para el despliegue estándar de este proyecto (un único rol de conexión), documentado explícitamente por si en el futuro se introduce un rol de migración separado de un rol de aplicación de menor privilegio.
