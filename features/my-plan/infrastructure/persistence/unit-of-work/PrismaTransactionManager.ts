import type { TransactionManager } from "@/features/my-plan/application/ports/TransactionManager";
import type { Prisma } from "@prisma/client";
import { withServiceContext } from "@/database/repositories/withStudentContext";

// Adaptador — implementa el puerto `TransactionManager` (Application
// Layer). Ningún Handler del Sprint 3.3.3 lo usa todavía (todos usan
// `UnitOfWork`, que ya encapsula begin+commit/rollback en una única
// llamada `execute()` con propagación automática vía `AsyncLocalStorage`
// — ver `PrismaUnitOfWork.ts`) — se implementa igualmente porque el
// puerto existe y el encargo de este sprint lo pide explícitamente.
//
// LIMITACIÓN CONOCIDA, documentada explícitamente (no oculta): Prisma no
// expone una API pública de `BEGIN`/`COMMIT`/`ROLLBACK` imperativos fuera
// de `$transaction(callback)`. Este adaptador tiende un puente mediante
// una promesa diferida — `begin()` abre la transacción de servicio y la
// deja "colgada" hasta que `commit()`/`rollback()` resuelven o rechazan
// una promesa interna, cerrando así la transacción subyacente — pero,
// A DIFERENCIA de `PrismaUnitOfWork`, NO propaga automáticamente el
// cliente resultante a los Repositories vía `AsyncLocalStorage`
// (`AsyncLocalStorage.run()` solo abarca la ejecución síncrona+async
// encadenada dentro de su propio callback, no llamadas independientes
// posteriores como `commit()` — usarlo aquí habría sido una falsa
// sensación de seguridad). Un consumidor de este puerto que necesite
// operar Repositories dentro de la transacción abierta debe leer el
// cliente activo con `getActiveTransactionClient()` y pasarlo
// explícitamente — este adaptador NO es un sustituto transparente de
// `UnitOfWork`, es un puente de bajo nivel para el puerto ya definido.
// Además, mantiene un único estado de instancia (`activeTx`): no es
// seguro para solicitudes concurrentes sobre la misma instancia
// compartida — cada composición (Server Action/Route Handler) debe
// crear su propia instancia por solicitud. Riesgo señalado en el
// informe de entrega; `UnitOfWork` sigue siendo la vía recomendada y la
// única usada por los Handlers actuales.
export class PrismaTransactionManager implements TransactionManager {
  private activeTx: Prisma.TransactionClient | null = null;
  private settleOutcome: ((outcome: "commit" | "rollback") => void) | null = null;
  private transactionClosed: Promise<void> | null = null;

  public async begin(): Promise<void> {
    if (this.activeTx) {
      throw new Error(
        "PrismaTransactionManager.begin(): ya existe una transacción activa sin cerrar (commit()/rollback() pendiente).",
      );
    }

    const clientReady = new Promise<Prisma.TransactionClient>((resolveClient) => {
      const outcomeSettled = new Promise<"commit" | "rollback">((resolveOutcome) => {
        this.settleOutcome = resolveOutcome;
      });

      this.transactionClosed = withServiceContext(async (tx) => {
        resolveClient(tx);
        const outcome = await outcomeSettled;
        if (outcome === "rollback") {
          throw new TransactionRolledBackSignal();
        }
      }).catch((error) => {
        if (!(error instanceof TransactionRolledBackSignal)) throw error;
      });
    });

    this.activeTx = await clientReady;
  }

  /** Cliente Prisma vinculado a la transacción abierta por `begin()` —
   * únicamente válido entre `begin()` y `commit()`/`rollback()`. */
  public getActiveTransactionClient(): Prisma.TransactionClient {
    if (!this.activeTx) {
      throw new Error("PrismaTransactionManager: no hay ninguna transacción activa — llama a begin() primero.");
    }
    return this.activeTx;
  }

  public async commit(): Promise<void> {
    this.settleOutcome?.("commit");
    await this.transactionClosed;
    this.activeTx = null;
    this.settleOutcome = null;
    this.transactionClosed = null;
  }

  public async rollback(): Promise<void> {
    this.settleOutcome?.("rollback");
    await this.transactionClosed;
    this.activeTx = null;
    this.settleOutcome = null;
    this.transactionClosed = null;
  }
}

class TransactionRolledBackSignal extends Error {
  constructor() {
    super("PrismaTransactionManager: rollback() solicitado explícitamente.");
  }
}
