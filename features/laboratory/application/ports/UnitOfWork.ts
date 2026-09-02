// Puerto — Unit of Work. `studentId`: si se provee, la implementación de
// infraestructura ejecuta `work()` bajo `withStudentContext` (RLS real);
// si se omite, bajo `withServiceContext`.
export interface UnitOfWork {
  execute<T>(work: () => Promise<T>, studentId?: string): Promise<T>;
}
