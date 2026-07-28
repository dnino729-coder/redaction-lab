import { AsyncLocalStorage } from "node:async_hooks";
import type { Prisma } from "@prisma/client";
import { withServiceContext } from "@/database/repositories/withStudentContext";

// Sprint 6.2 — Infrastructure Layer de Academia. Reutiliza EXACTAMENTE el
// patrón ya en producción de features/my-plan/infrastructure/persistence/
// PrismaClientContext.ts (AsyncLocalStorage propagando la transacción activa
// de Prisma durante `UnitOfWork.execute()`), y el mecanismo de RLS
// compartido `withServiceContext`/`withStudentContext` de
// `database/repositories/withStudentContext.ts` (mismo módulo que ya usan
// Dashboard y Mi Plan — no se duplica, se reutiliza directamente).
//
// Nota de alcance (por qué esta clase existe por módulo y no se importa
// directamente la de Mi Plan): cada AsyncLocalStorage es una instancia en
// memoria independiente — reutilizar literalmente el singleton de Mi Plan
// haría que una transacción de Academia y una de Mi Plan pudieran
// interferir si ambas se ejecutan concurrentemente en el mismo proceso
// Node. El patrón (no la instancia) es lo que se reutiliza, igual que
// domain/value-objects/Identifier.ts ya declara explícitamente ("ninguna
// feature accede directamente a los tipos internos de otra").
const transactionStorage = new AsyncLocalStorage<Prisma.TransactionClient>();

/** Usado únicamente por `PrismaUnitOfWork.execute()` — ejecuta `fn` con
 * `tx` como transacción activa para toda la duración de la llamada. */
export function runWithActiveTransaction<T>(
  tx: Prisma.TransactionClient,
  fn: () => Promise<T>,
): Promise<T> {
  return transactionStorage.run(tx, fn);
}

/**
 * Punto de entrada único de todos los Repositories/Read Model de Academia
 * para obtener un cliente Prisma: si existe una transacción activa (dentro
 * de `UnitOfWork.execute()`), la reutiliza; si no, abre una transacción de
 * servicio de corta duración propia (red de seguridad para usos fuera de un
 * Handler — p. ej. el Read Model de Queries, que nunca pasa por
 * `UnitOfWork`).
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
