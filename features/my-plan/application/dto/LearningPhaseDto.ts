// Read Model de `GetLearningPhases` (vertical slice "connect phases and
// tasks") — mismo criterio de minimalidad que
// `LearningGoalSummaryDto`/`LearningGoalsReadModel`: expone únicamente los
// campos que `PhasesAndTasks.tsx` realmente renderiza hoy (id/name/status
// de la fase; id/title/status/source de la tarea), no la entidad completa
// ni columnas no consumidas por la UI (`phaseOrder`, `startDate`,
// `endDate`, `description`, `estimatedMinutes`, `difficulty`, `dueDate`).
//
// `phaseOrder` NO se expone en el DTO — se usa únicamente dentro del
// Handler para ordenar el array de fases antes de mapear (ver
// GetLearningPhasesHandler.ts), porque la UI no lo renderiza directamente,
// solo depende de que las fases lleguen ya en orden.
//
// `sessions`/StudySession: deliberadamente NO incluido — ver
// GetLearningPhasesHandler.ts para la justificación completa (repositorio
// existente sin ningún llamador real hoy; fuera de alcance de este slice).
export interface LearningTaskSummaryDto {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly source: string;
}

export interface LearningPhaseSummaryDto {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly tasks: readonly LearningTaskSummaryDto[];
}

export interface LearningPhasesReadModel {
  readonly phases: readonly LearningPhaseSummaryDto[];
}

export interface GetLearningPhasesRequestDto {
  readonly studentId: string;
}
