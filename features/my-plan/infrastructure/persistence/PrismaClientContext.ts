import { AsyncLocalStorage } from "node:async_hooks";
import type { Prisma } from "@prisma/client";
import { withServiceContext } from "@/database/repositories/withStudentContext";

// HALLAZGO ARQUITECTÓNICO DETECTADO EN EL SPRINT 3.3.4 (documentado, no
// silenciado — ver informe de entrega, sección "Problemas encontrados") Y
// RESUELTO POR LA RESOLUCIÓN 18.24 (Sprint 3.3.4.1): el puerto
// `UnitOfWork` no transportaba `studentId`, por lo que ningún Repository
// podía invocar `withStudentContext(studentId, ...)` — el mecanismo de
// RLS por estudiante (`dashboard_app_role` + `current_student_id()`,
// migración `202607171400_my_plan_rls_policies`) exige precisamente ese
// dato para evaluarse. La resolución 18.24 amplió `UnitOfWork.execute()`
// con un segundo parámetro opcional `studentId` (ver
// `PrismaUnitOfWork.ts`): cuando el Handler lo provee — únicamente en los
// casos donde la matriz de RLS ya migrada cubre TODAS las tablas tocadas
// por esa operación, ver 18.24 para la lista exacta —, la transacción se
// abre con `withStudentContext` en vez de `withServiceContext`. Donde el
// Handler no lo provee (operaciones que tocan una tabla sin GRANT de
// escritura para `dashboard_app_role`, p. ej. `learning_plan`, o que
// mezclan una tabla de escritura estudiante con una de escritura
// exclusiva de servicio dentro de la misma transacción), se conserva
// `withServiceContext` — deuda explícitamente reconocida en 18.24, no
// resuelta por esta corrección. En ambos casos, Application Layer
// (`OwnershipVerificationService`, Sprint 3.3.3) sigue verificando la
// propiedad de cada recurso como capa de autorización independiente de
// RLS — complemento, no sustituto (18.24).
//
// `AsyncLocalStorage` propaga la transacción activa de Prisma durante la
// ejecución de `UnitOfWork.execute()` (ver `PrismaUnitOfWork.ts`) para
// que TODOS los Repositories invocados dentro de ese `work()` compartan
// la misma transacción Postgres (atomicidad real) sin que el dominio ni
// la aplicación conozcan Prisma en absoluto — el propio Handler nunca ve
// ni pasa un `tx`.
const transactionStorage = new AsyncLocalStorage<Prisma.TransactionClient>();

/** Usado únicamente por `PrismaUnitOfWork.execute()` — ejecuta `fn` con
 * `tx` como transacción activa para toda la duración de la llamada
 * (incluye llamadas asíncronas anidadas dentro de `fn`). */
export function runWithActiveTransaction<T>(
  tx: Prisma.TransactionClient,
  fn: () => Promise<T>,
): Promise<T> {
  return transactionStorage.run(tx, fn);
}

/**
 * Punto de entrada único de todos los Repositories/Query Services de Mi
 * Plan para obtener un cliente Prisma con el que operar: si existe una
 * transacción activa (dentro de `UnitOfWork.execute()`), la reutiliza —
 * garantizando atomicidad entre varias escrituras de un mismo caso de
 * uso; si no, abre una transacción de servicio de corta duración propia
 * para esa única operación. Desde 18.24, los 14 Handlers de Mi Plan
 * envuelven toda lectura/escritura en `UnitOfWork.execute()`, por lo que
 * esta rama de respaldo (`withServiceContext` directo, sin transacción
 * activa) queda como red de seguridad para usos futuros fuera de un
 * Handler, no como camino habitual.
 */
export async function withActiveClient<T>(
  fn: (client: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  const activeTransaction = transactionStorage.getStore();
  if (activeTransaction) {
    return fn(activeTransaction);
  }
  return withServiceContext((tx) => fn(tx));
}
