import { DomainInvariantViolationException } from "../exceptions/DomainInvariantViolationException";

// Value Object — porcentaje de avance (13.4, regla MUST: "el % de avance se
// mantiene entre 0 y 100"). No es la entidad de persistencia
// `LearningProgress` (13.4, fuera del alcance de este sprint de dominio,
// que cubre exactamente las 7 entidades listadas en el encargo) — se
// nombra deliberadamente distinto (`CompletionProgress`) para evitar
// colisión conceptual entre "la tabla LearningProgress" y "un porcentaje
// calculado en memoria por una entidad de este dominio". Lo usan
// internamente `AutoCompletionStatusCalculator` y, a través de él,
// `LearningGoal`/`LearningPhase`, para decidir su `status` calculado.
export class CompletionProgress {
  private constructor(public readonly percentage: number) {}

  public static fromCounts(completed: number, total: number): CompletionProgress {
    if (!Number.isInteger(completed) || !Number.isInteger(total)) {
      throw new DomainInvariantViolationException(
        `completed (${completed}) y total (${total}) deben ser enteros.`,
      );
    }
    if (completed < 0 || total < 0) {
      throw new DomainInvariantViolationException(
        `Los conteos de progreso no pueden ser negativos (completed=${completed}, total=${total}).`,
      );
    }
    if (completed > total) {
      throw new DomainInvariantViolationException(
        `completed (${completed}) no puede superar total (${total}).`,
      );
    }
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 10000) / 100;
    return new CompletionProgress(percentage);
  }

  public static zero(): CompletionProgress {
    return new CompletionProgress(0);
  }

  public get isComplete(): boolean {
    return this.percentage === 100;
  }

  public equals(other: CompletionProgress | null | undefined): boolean {
    if (!other) return false;
    return this.percentage === other.percentage;
  }
}
