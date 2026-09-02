import { AsyncLocalStorage } from "node:async_hooks";
import type { Prisma } from "@prisma/client";
import { withServiceContext } from "@/database/repositories/withStudentContext";

// AsyncLocalStorage propia de Laboratoire — instancia independiente de la
// de Academia/Mi Plan (cada módulo mantiene la suya, nunca se comparte,
// mismo criterio ya aplicado a Entity/AggregateRoot/DomainEvent/Identifier).
const transactionStorage = new AsyncLocalStorage<Prisma.TransactionClient>();

/** Usado únicamente por un futuro `UnitOfWork.execute()` de Laboratoire. */
export function runWithActiveTransaction<T>(
  tx: Prisma.TransactionClient,
  fn: () => Promise<T>,
): Promise<T> {
  return transactionStorage.run(tx, fn);
}

/**
 * Punto de entrada único de los repositorios de Laboratoire: reutiliza la
 * transacción activa si existe, o abre una transacción de servicio propia
 * (`withServiceContext`) como red de seguridad — nunca accede a Prisma sin
 * pasar por RLS.
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
