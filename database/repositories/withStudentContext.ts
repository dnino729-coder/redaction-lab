// Envoltura de contexto de sesión para Row Level Security (sección 5.5 MUST,
// prisma/migrations/202607170900_dashboard_rls_policies/migration.sql).
// Toda lectura del Dashboard debe ejecutarse dentro de esta transacción: fija
// `app.current_student_id` para la sesión Postgres actual antes de correr la
// consulta, de modo que las políticas RLS (`current_student_id() =
// student_id`) puedan evaluarse. Nunca se usa el cliente Prisma "pelado" (sin
// este wrapper) para leer datos de un estudiante — ver
// docs/modules/dashboard.md, sección 10, "Seguridad de datos".

import type { Prisma} from "@prisma/client";
import { type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type StudentScopedClient = Prisma.TransactionClient;

/**
 * Ejecuta `callback` dentro de una transacción con el rol `dashboard_app_role`
 * y `app.current_student_id` fijado al UUID del estudiante autenticado,
 * habilitando las políticas RLS de la migración de RLS para esa transacción
 * únicamente. Con este rol (sin BYPASSRLS, no propietario de las tablas)
 * solo puede leer datos del propio estudiante, nunca escribir en
 * `student_dashboard` (esa escritura exige `withServiceContext`).
 *
 * CORRECCIÓN CRÍTICA (auditoría de producción, bloqueante de seguridad
 * resuelto): esta función antes SOLO fijaba `app.current_student_id`, sin
 * cambiar el rol de Postgres activo en la conexión. Eso significa que la
 * consulta se ejecutaba con el rol de conexión crudo de Prisma
 * (`DATABASE_URL`) — si ese rol es el propietario de las tablas o un
 * superusuario (caso por defecto de Supabase, rol `postgres`), Postgres
 * **ignora las políticas RLS por completo** para ese rol, sin importar que
 * `ENABLE ROW LEVEL SECURITY` esté activo: la restricción de fila nunca se
 * aplicaba en la práctica. La corrección es simétrica a la que ya existía en
 * `withServiceContext`: cambiar explícitamente a `dashboard_app_role` antes
 * de fijar `app.current_student_id`, para que RLS se evalúe realmente.
 */
export async function withStudentContext<T>(
  studentId: string,
  callback: (tx: StudentScopedClient) => Promise<T>,
  client: PrismaClient = prisma,
): Promise<T> {
  return client.$transaction(async (tx) => {
    // SET LOCAL ROLE debe ejecutarse antes de fijar app.current_student_id:
    // ambos son SQL crudo porque ni el nombre de rol ni las variables de
    // sesión son parametrizables como un valor normal de consulta.
    await tx.$executeRawUnsafe("SET LOCAL ROLE dashboard_app_role");
    await tx.$executeRaw`SELECT set_config('app.current_student_id', ${studentId}, true)`;
    return callback(tx);
  });
}

/**
 * Ejecuta `callback` dentro de una transacción bajo `dashboard_service_role`
 * (BYPASSRLS, migración de RLS) — para operaciones servidor-a-servidor sin
 * sesión de estudiante todavía resuelta: (a) resolución de identidad
 * Clerk→estudiante y aprovisionamiento/sincronización de `User` desde el
 * webhook de Clerk (services/auth/clerkProvisioning.ts, sección 12.3/12.4 —
 * en ese punto el `studentId` interno aún no existe o no se conoce), y (b) la
 * escritura del consolidado `student_dashboard` (13.8). Nunca se usa para
 * servir una petición HTTP de un estudiante ya autenticado (regla MUST,
 * docs/modules/dashboard.md sección 10: "nunca con una credencial de
 * servicio de alcance global, salvo en procesos programados de refresco" —
 * la resolución de identidad y el aprovisionamiento de webhook son la
 * excepción explícita, no una petición de estudiante). Requiere que el rol
 * de conexión de Prisma tenga membresía otorgada sobre `dashboard_service_role`
 * (`GRANT dashboard_service_role TO <rol de conexión>`, otorgado
 * automáticamente a `CURRENT_USER` por la migración de RLS) — de lo
 * contrario `SET LOCAL ROLE` falla.
 */
export async function withServiceContext<T>(
  callback: (tx: StudentScopedClient) => Promise<T>,
  client: PrismaClient = prisma,
): Promise<T> {
  return client.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET LOCAL ROLE dashboard_service_role");
    return callback(tx);
  });
}
