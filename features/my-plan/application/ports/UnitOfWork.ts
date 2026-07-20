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
//
// `studentId` (resolución 18.24): parámetro opcional que el Handler
// llamante provee cuando — y solo cuando — la matriz de RLS ya migrada
// (`202607171400_my_plan_rls_policies`) otorga a `dashboard_app_role`
// los `GRANT`/políticas necesarios para TODAS las escrituras (o
// lecturas) que ocurren dentro de `work()`. Si se provee, la
// implementación de infraestructura debe ejecutar `work()` bajo el
// contexto de sesión del propio estudiante (`withStudentContext`); si se
// omite, conserva el comportamiento previo (`withServiceContext`). Ver
// 18.24 para la matriz completa de qué casos de uso pueden pasarlo y
// cuáles no. No es un dato nuevo: es el mismo `StudentId` que Application
// ya posee en cada Handler.
export interface UnitOfWork {
  /**
   * Ejecuta `work` dentro de una única transacción lógica. Si `work`
   * lanza cualquier excepción, ninguna escritura realizada dentro de él
   * debe persistir (comportamiento atómico) — la implementación de
   * infraestructura decide cómo revertir.
   */
  execute<T>(work: () => Promise<T>, studentId?: string): Promise<T>;
}
