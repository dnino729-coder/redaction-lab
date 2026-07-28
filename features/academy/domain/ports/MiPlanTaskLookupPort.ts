// Puerto de dominio — resuelve la tarea de Mi Plan vinculada (si existe) a
// una AcademyUnit, consultado por Application Layer antes de invocar
// `AcademyUnit.completeFromAttempt()` (RN-10, A-08). Devuelve el
// identificador de la tarea vinculada, o `null` si no existe ninguna —
// Academia nunca escribe directamente sobre datos de Mi Plan (Sección 1),
// solo consulta en modo lectura a través de este puerto.
export interface MiPlanTaskLookupPort {
  findLinkedTaskId(studentId: string, unitId: string): Promise<string | null>;
}
