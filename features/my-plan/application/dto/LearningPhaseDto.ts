// Read Model de `GetLearningPhases` (vertical slice "connect phases and
// tasks", ampliado por "connect study session history") — mismo criterio
// de minimalidad que `LearningGoalSummaryDto`/`LearningGoalsReadModel`:
// expone únicamente los campos que `PhasesAndTasks.tsx` realmente
// renderiza (id/name/status de la fase; id/title/status/source/sessions
// de la tarea), no la entidad completa ni columnas no consumidas por la
// UI (`phaseOrder`, `startDate`, `endDate`, `description`,
// `estimatedMinutes`, `difficulty`, `dueDate`).
//
// `phaseOrder` NO se expone en el DTO — se usa únicamente dentro del
// Handler para ordenar el array de fases antes de mapear (ver
// GetLearningPhasesHandler.ts), porque la UI no lo renderiza directamente,
// solo depende de que las fases lleguen ya en orden.
export interface LearningTaskSessionSummaryDto {
  readonly id: string;
  readonly startedAt: string;
  readonly finishedAt: string | null;
  readonly durationMinutes: number | null;
  readonly completed: boolean;
}

export interface LearningTaskSummaryDto {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly source: string;
  // StudySession: incluido desde "connect study session history" —
  // reutiliza StudySessionRepository.findByLearningTaskId (existente,
  // primer llamador real) dentro de esta misma consulta, en vez de un
  // endpoint dedicado por tarea (evitaría N+1 peticiones HTTP desde el
  // frontend, ver GetLearningPhasesHandler.ts). Sin `studentId`/
  // `learningTaskId` propios: la tarea ya está scoped por la cadena
  // plan→fase→tarea de este mismo Handler, no hace falta repetirlos.
  readonly sessions: readonly LearningTaskSessionSummaryDto[];
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
