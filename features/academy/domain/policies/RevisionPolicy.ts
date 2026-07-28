import { RevisionCycleIncompleteException } from "../exceptions/RevisionCycleIncompleteException";

// Policy (Domain Model v1.1, RN-4) — debe existir al menos un ciclo
// completo Producción → Retroalimentación antes de avanzar de `REWRITE` a
// `REFLECT`. Invocada por `Attempt.advanceToReflection()` sobre sí mismo
// (H-02). Estructuralmente, alcanzar `REWRITE` ya implica que ese primer
// ciclo ocurrió (el paso `RECEIVE_FEEDBACK` solo se alcanza tras
// `ProductionSubmitted`); esta Policy actúa como verificación defensiva
// explícita de esa invariante, no como una puerta adicional que el
// estudiante deba satisfacer de forma separada.
export class RevisionPolicy {
  public assertMinimumCycleComplete(params: {
    attemptId: string;
    versionsCount: number;
    feedbacksCount: number;
  }): void {
    if (params.versionsCount === 0 || params.feedbacksCount === 0) {
      throw new RevisionCycleIncompleteException(params.attemptId);
    }
  }
}
