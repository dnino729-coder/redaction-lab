import { CompletionProgress } from "@/features/my-plan/domain/value-objects/CompletionProgress";
import { LearningTaskStatus } from "@/features/my-plan/domain/enums/LearningTaskStatus";

export interface LearningProgressCounts {
  readonly completedTasks: number;
  readonly totalTasks: number;
  readonly completionPercentage: number;
}

// Servicio de aplicación puro (sin I/O) — calcula
// completedTasks/totalTasks/completionPercentage a partir de los `status`
// ya cargados de todas las `LearningTask` de un plan. Reutilizado por
// GenerateInitialPlanStructureHandler (onboarding) y
// CompleteLearningTaskHandler (finalización de tarea) para no duplicar la
// regla de cálculo en dos sitios.
//
// Regla (resolución 18.21, citada textualmente en
// domain/services/AutoCompletionStatusCalculator.ts: "[CANCELLED] queda
// excluido tanto del cálculo de LearningProgress como de las condiciones
// de completado automático de sus entidades padre"):
// - CANCELLED: excluido de totalTasks (y por tanto de completedTasks).
// - NOT_STARTED / IN_PROGRESS: cuentan para totalTasks, no para completedTasks.
// - COMPLETED: cuenta para ambos.
// - `source` no afecta el cálculo — 18.21 no distingue por source.
// - `LearningPhase.status` NO se usa como filtro — ninguna resolución
//   documentada lo exige (ver auditoría "Learning Progress Architecture
//   Audit", sección 12).
//
// `completionPercentage` reutiliza `CompletionProgress.fromCounts()` (VO
// de dominio ya existente, ya probado, hasta ahora sin ningún llamador
// real) — no se duplica su lógica de redondeo aquí.
export class LearningProgressCalculator {
  public static fromTaskStatuses(
    taskStatuses: readonly LearningTaskStatus[],
  ): LearningProgressCounts {
    const relevant = taskStatuses.filter((status) => status !== LearningTaskStatus.CANCELLED);
    const totalTasks = relevant.length;
    const completedTasks = relevant.filter(
      (status) => status === LearningTaskStatus.COMPLETED,
    ).length;
    const completionPercentage = CompletionProgress.fromCounts(
      completedTasks,
      totalTasks,
    ).percentage;

    return { completedTasks, totalTasks, completionPercentage };
  }
}
