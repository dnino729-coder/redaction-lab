// Puerto — primitiva de transacción de bajo nivel, complementaria a
// `UnitOfWork` (ver nota en ese archivo). Se declara por separado porque
// el encargo del sprint lista ambos contratos explícitamente; ningún
// Handler de este sprint depende de `TransactionManager` directamente —
// existe como contrato disponible para una futura infraestructura que
// necesite control transaccional más granular que el que ofrece
// `UnitOfWork.execute()`.
export interface TransactionManager {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
