import { DomainInvariantViolationException } from "../exceptions/DomainInvariantViolationException";

// Value Object — `StudySession.duration_minutes` (13.4). Refleja
// literalmente el invariante ya implementado en la migración de Sprint
// 3.3.1 (`ck_study_session_duration_minutes`: "duration_minutes IS NULL OR
// duration_minutes >= 0") — el dominio reafirma la misma regla de forma
// independiente de esa migración, sin conocerla ni depender de ella.
export class SessionDuration {
  private constructor(public readonly minutes: number) {}

  public static create(minutes: number): SessionDuration {
    if (!Number.isFinite(minutes) || minutes < 0) {
      throw new DomainInvariantViolationException(
        `duration_minutes debe ser un número >= 0 (recibido: ${minutes}) — ver ck_study_session_duration_minutes.`,
      );
    }
    return new SessionDuration(Math.trunc(minutes));
  }

  public equals(other: SessionDuration | null | undefined): boolean {
    if (!other) return false;
    return this.minutes === other.minutes;
  }
}
