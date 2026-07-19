// La acción de transición es explícita (`action`) en vez de 4 endpoints
// separados — ver informe de entrega, sección "Ambigüedad reportada", para
// la justificación de por qué `UpdateLearningObjective` se interpreta
// como transición de estado y no como edición de campos escalares (el
// dominio no expone un mutador de título/descripción para esta entidad).
export type LearningObjectiveTransitionAction = "START" | "COMPLETE" | "REVERT" | "CANCEL";

export interface UpdateLearningObjectiveRequestDto {
  readonly objectiveId: string;
  readonly studentId: string;
  readonly action: LearningObjectiveTransitionAction;
}

export interface LearningObjectiveResponseDto {
  readonly id: string;
  readonly learningGoalId: string;
  readonly title: string;
  readonly description: string | null;
  readonly orderNumber: number;
  readonly completedAt: string | null;
  readonly status: string;
}
