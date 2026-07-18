import { DomainException } from "./DomainException";

// Se lanza cuando un Value Object o una entidad recibe datos que violan un
// invariante de dominio explícitamente documentado (13.4, 18.21) — p. ej.
// un `SessionDuration` negativo (ck_study_session_duration_minutes), un
// `CompletionProgress` fuera de 0-100, o un `completed_at` inconsistente
// con `status` (invariante de 18.21, punto 2).
export class DomainInvariantViolationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
