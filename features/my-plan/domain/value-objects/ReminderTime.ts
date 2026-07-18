import { DomainInvariantViolationException } from "../exceptions/DomainInvariantViolationException";

// Value Object — `StudySchedule.reminder_time` (13.4, columna TIME,
// nullable). Se modela como hora/minuto en vez de envolver un `Date`
// completo porque, semánticamente, un recordatorio diario no tiene fecha
// propia (es un hueco horario que se repite cada día programado).
export class ReminderTime {
  private constructor(
    public readonly hour: number,
    public readonly minute: number,
  ) {}

  public static create(hour: number, minute: number): ReminderTime {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      throw new DomainInvariantViolationException(
        `La hora del recordatorio debe ser un entero entre 0 y 23 (recibido: ${hour}).`,
      );
    }
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
      throw new DomainInvariantViolationException(
        `El minuto del recordatorio debe ser un entero entre 0 y 59 (recibido: ${minute}).`,
      );
    }
    return new ReminderTime(hour, minute);
  }

  public toMinutesSinceMidnight(): number {
    return this.hour * 60 + this.minute;
  }

  public equals(other: ReminderTime | null | undefined): boolean {
    if (!other) return false;
    return this.hour === other.hour && this.minute === other.minute;
  }

  public toString(): string {
    const hh = String(this.hour).padStart(2, "0");
    const mm = String(this.minute).padStart(2, "0");
    return `${hh}:${mm}`;
  }
}
