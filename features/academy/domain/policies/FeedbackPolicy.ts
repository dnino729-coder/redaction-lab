import { FEEDBACK_CATEGORY_PRIORITY } from "../enums/FeedbackCategory";
import type { FeedbackObservation } from "../value-objects/FeedbackObservation";
import { FeedbackPolicyViolationException } from "../exceptions/FeedbackPolicyViolationException";

// Policy (Domain Model v1.1, RN-3) — toda retroalimentación se expresa
// exclusivamente mediante las 10 `FeedbackCategory` (nunca la rúbrica
// oficial DELF), en orden jerárquico macro→micro (H-07,
// `FEEDBACK_CATEGORY_PRIORITY`). Invocada por `Attempt.recordFeedback()`
// sobre sí mismo (H-02).
export class FeedbackPolicy {
  public assertValid(observations: readonly FeedbackObservation[]): void {
    if (observations.length === 0) {
      throw new FeedbackPolicyViolationException(
        "una Feedback debe contener al menos una FeedbackObservation.",
      );
    }
  }

  /** Ordena las observaciones en la jerarquía macro→micro oficial
   * (H-07) — nunca depende del orden en que el proveedor de IA/Profesor
   * las haya entregado. */
  public sortByPriority(
    observations: readonly FeedbackObservation[],
  ): FeedbackObservation[] {
    return [...observations].sort(
      (a, b) => FEEDBACK_CATEGORY_PRIORITY[a.category] - FEEDBACK_CATEGORY_PRIORITY[b.category],
    );
  }
}
