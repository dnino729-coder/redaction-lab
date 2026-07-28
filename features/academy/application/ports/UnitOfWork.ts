// Puerto — Unit of Work (mismo patrón exacto que
// features/my-plan/application/ports/UnitOfWork.ts). `studentId`
// (Resolución 18.24): si se provee, la implementación de infraestructura
// ejecuta `work()` bajo `withStudentContext` (RLS real); si se omite,
// bajo `withServiceContext`.
export interface UnitOfWork {
  execute<T>(work: () => Promise<T>, studentId?: string): Promise<T>;
}
