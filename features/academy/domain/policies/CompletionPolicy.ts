// Policy (Domain Model v1.1, RN-10) — el evento EXTERNAL_ACTIVITY_COMPLETED
// se emite exactamente una vez por Unidad, únicamente en la transición a
// COMPLETED, y solo si existe una tarea de Mi Plan vinculada (A-08).
// Invocada por `AcademyUnit.completeFromAttempt()` sobre sí misma (H-02),
// a partir de la información ya resuelta por Application Layer vía
// `MiPlanTaskLookupPort` (puerto de dominio, ver domain/ports).
export class CompletionPolicy {
  public shouldEmitExternalActivityCompleted(hasLinkedMiPlanTask: boolean): boolean {
    return hasLinkedMiPlanTask;
  }
}
