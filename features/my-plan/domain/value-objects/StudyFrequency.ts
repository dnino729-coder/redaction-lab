import { DomainInvariantViolationException } from "../exceptions/DomainInvariantViolationException";

// Value Object — encapsula los 3 campos numéricos de `StudySchedule` (13.4:
// "days_per_week, sessions_per_day, minutes_per_session") como una unidad
// inmutable y autovalidada, en vez de 3 primitivos sueltos (evita
// "primitive obsession"). El esquema de persistencia (Sprint 3.3.1) no
// declara un CHECK numérico para estos 3 campos; el dominio aplica aquí
// límites de sentido común no contradichos por ninguna resolución (un plan
// no puede estudiarse 0 días/semana ni con sesiones de 0 minutos, y una
// semana tiene como máximo 7 días) — de ser demasiado estrictos para un
// caso real, es una validación de dominio, más fácil de relajar que un
// CHECK de base de datos ya migrado.
export class StudyFrequency {
  private constructor(
    public readonly daysPerWeek: number,
    public readonly sessionsPerDay: number,
    public readonly minutesPerSession: number,
  ) {}

  public static create(params: {
    daysPerWeek: number;
    sessionsPerDay: number;
    minutesPerSession: number;
  }): StudyFrequency {
    const { daysPerWeek, sessionsPerDay, minutesPerSession } = params;

    if (!Number.isInteger(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7) {
      throw new DomainInvariantViolationException(
        `days_per_week debe ser un entero entre 1 y 7 (recibido: ${daysPerWeek}).`,
      );
    }
    if (!Number.isInteger(sessionsPerDay) || sessionsPerDay < 1) {
      throw new DomainInvariantViolationException(
        `sessions_per_day debe ser un entero >= 1 (recibido: ${sessionsPerDay}).`,
      );
    }
    if (!Number.isInteger(minutesPerSession) || minutesPerSession < 1) {
      throw new DomainInvariantViolationException(
        `minutes_per_session debe ser un entero >= 1 (recibido: ${minutesPerSession}).`,
      );
    }

    return new StudyFrequency(daysPerWeek, sessionsPerDay, minutesPerSession);
  }

  /** Minutos totales de estudio planificados por semana. */
  public get weeklyMinutes(): number {
    return this.daysPerWeek * this.sessionsPerDay * this.minutesPerSession;
  }

  public equals(other: StudyFrequency | null | undefined): boolean {
    if (!other) return false;
    return (
      this.daysPerWeek === other.daysPerWeek &&
      this.sessionsPerDay === other.sessionsPerDay &&
      this.minutesPerSession === other.minutesPerSession
    );
  }
}
