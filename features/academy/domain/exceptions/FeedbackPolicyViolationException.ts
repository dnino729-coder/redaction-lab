import { DomainException } from "./DomainException";

// FeedbackPolicy (Domain Model v1.1): reglas de cuándo/cómo se puede
// registrar o solicitar Feedback sobre una Version. Corresponde a
// ACADEMY_RULE_FEEDBACK_POLICY_VIOLATION.
export class FeedbackPolicyViolationException extends DomainException {
  public constructor(reason: string) {
    super(
      `Violación de FeedbackPolicy: ${reason}`,
      "ACADEMY_RULE_FEEDBACK_POLICY_VIOLATION",
    );
  }
}
