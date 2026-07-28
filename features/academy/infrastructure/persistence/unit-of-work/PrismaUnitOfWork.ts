import type { UnitOfWork } from "@/features/academy/application/ports/UnitOfWork";
import { withServiceContext, withStudentContext } from "@/database/repositories/withStudentContext";
import { runWithActiveTransaction } from "../PrismaClientContext";

// Adaptador — implementa el puerto `UnitOfWork` de Academia (Application
// Layer, Sprint 6.1) EXACTAMENTE con el mismo patrón que
// features/my-plan/infrastructure/persistence/unit-of-work/PrismaUnitOfWork.ts
// (Resolución 18.24, ya en producción): AsyncLocalStorage propaga la
// transacción activa durante `work()` — ningún Handler ve ni pasa un `tx`
// (brief Sprint 6.2, Sección 3: "sin exponer tx a los handlers").
//
// Nota de reconciliación (no BLOCKER): la Persistence Layer Specification
// v1.0 (Sprint 5.1, Sección 6) documentó `UnitOfWork.execute(work: (tx:
// UnitOfWorkTransaction) => ..., studentId?)` — con `tx` expuesto,
// ensamblando los 4 Repositories + Outbox dentro del propio callback. Esa
// firma nunca se implementó (el puerto real de Application, Sprint 6.1,
// ya declara `execute<T>(work: () => Promise<T>, studentId?)`, sin `tx` —
// mismo patrón de Mi Plan). El encargo de este Sprint 6.2 zanja
// explícitamente la tensión a favor del patrón sin `tx`
// ("PrismaUnitOfWork... sin exponer tx a los handlers"), consistente con
// lo que Application Layer ya implementa y con lo que no puede
// modificarse en este Sprint. Se documenta, no se silencia.
export class PrismaUnitOfWork implements UnitOfWork {
  public async execute<T>(work: () => Promise<T>, studentId?: string): Promise<T> {
    if (studentId) {
      return withStudentContext(studentId, (tx) => runWithActiveTransaction(tx, work));
    }
    return withServiceContext((tx) => runWithActiveTransaction(tx, work));
  }
}
