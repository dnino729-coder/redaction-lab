import { ApplicationException } from "./ApplicationException";

// Traduce las excepciones de dominio ACADEMY_RULE_*/ACADEMY_CONFLICT_*
// (BusinessRuleViolation/ConflictError) — 409/422 según Error Mapping
// (Infrastructure Services + API Layer v1.0 §17).
export class ConflictException extends ApplicationException {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
