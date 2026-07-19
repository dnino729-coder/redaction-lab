// Puerto — Unit of Work. Coordina que todas las escrituras de repositorio
// realizadas dentro de `execute()` se confirmen (o reviertan) como una
// única unidad atómica. La Application Layer solo declara este contrato;
// la implementación real (transacción de Postgres, `withStudentContext`,
// etc.) es infraestructura, explícitamente fuera de alcance de este
// sprint ("Diseñar UnitOfWork... No implementar la infraestructura. Solo
// la interfaz y la coordinación").
//
// Relación con `TransactionManager` (ports/TransactionManager.ts): son
// contratos complementarios, no redundantes. `TransactionManager` expone
// la primitiva de bajo nivel (`begin`/`commit`/`rollback`) que una
// implementación de infraestructura de `UnitOfWork` podría usar
// internamente; los Handlers de este sprint dependen únicamente de
// `UnitOfWork` (la abstracción de más alto nivel), nunca directamente de
// `TransactionManager`.
export interface UnitOfWork {
  /**
   * Ejecuta `work` dentro de una única transacción lógica. Si `work`
   * lanza cualquier excepción, ninguna escritura realizada dentro de él
   * debe persistir (comportamiento atómico) — la implementación de
   * infraestructura decide cómo revertir.
   */
  execute<T>(work: () => Promise<T>): Promise<T>;
}
