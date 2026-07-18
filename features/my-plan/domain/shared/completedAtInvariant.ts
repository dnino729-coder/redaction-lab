import { DomainInvariantViolationException } from "../exceptions/DomainInvariantViolationException";

// Invariante compartido por `LearningGoal`, `LearningObjective`,
// `LearningPhase` y `LearningTask` (resolución 18.21, punto 2):
// "completed_at IS NOT NULL si y solo si status = COMPLETED". Se
// centraliza aquí porque las 4 entidades aplicaban exactamente la misma
// regla por separado — la auditoría del Sprint 3.3.2 (hallazgo 1,
// sección 2) señaló esa duplicación; este archivo la cierra sin cambiar
// el comportamiento ni el texto de ningún mensaje de error ya existente.
export function assertCompletedAtInvariant(
  entityName: string,
  status: string,
  completedAt: Date | null,
): void {
  const isCompleted = status === "COMPLETED";
  const hasCompletedAt = completedAt !== null;
  if (isCompleted !== hasCompletedAt) {
    throw new DomainInvariantViolationException(
      `${entityName}: completed_at (${completedAt}) es inconsistente con status (${status}) — 18.21: completed_at IS NOT NULL si y solo si status = COMPLETED.`,
    );
  }
}
