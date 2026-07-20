import type { UnitOfWork } from "@/features/my-plan/application/ports/UnitOfWork";
import { withServiceContext, withStudentContext } from "@/database/repositories/withStudentContext";
import { runWithActiveTransaction } from "../PrismaClientContext";

// Adaptador — implementa el puerto `UnitOfWork` (Application Layer,
// Sprint 3.3.3, firma ampliada por la resolución 18.24). Abre una única
// transacción Postgres y la propaga vía `AsyncLocalStorage` durante toda
// la ejecución de `work()` — todos los Repositories/Query Services
// invocados dentro de ese `work()`, sin importar cuántos ni en qué
// orden, comparten la MISMA transacción: si `work()` lanza, Postgres
// revierte todo (atomicidad real, no simulada).
//
// Resolución 18.24: cuando el Handler llamante provee `studentId` — solo
// cuando la matriz de RLS ya migrada (`202607171400_my_plan_rls_policies`)
// garantiza que TODAS las tablas tocadas dentro de `work()` tienen el
// GRANT/política necesarios para `dashboard_app_role` — se abre la
// transacción con `withStudentContext(studentId, ...)` (RLS real, rol sin
// BYPASSRLS). En cualquier otro caso (parámetro omitido) se conserva el
// comportamiento previo: `withServiceContext(...)` (`dashboard_service_role`,
// BYPASSRLS). Ver 18.24 para la lista exacta de qué Handlers pasan
// `studentId` y cuáles no, y por qué.
export class PrismaUnitOfWork implements UnitOfWork {
  public async execute<T>(work: () => Promise<T>, studentId?: string): Promise<T> {
    if (studentId) {
      return withStudentContext(studentId, (tx) => runWithActiveTransaction(tx, work));
    }
    return withServiceContext((tx) => runWithActiveTransaction(tx, work));
  }
}
