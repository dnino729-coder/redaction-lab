export interface StudySessionResponseDto {
  readonly id: string;
  readonly studentId: string;
  readonly learningTaskId: string;
  readonly startedAt: string;
  readonly finishedAt: string | null;
  readonly durationMinutes: number | null;
  readonly completed: boolean;
}

export interface CreateStudySessionRequestDto {
  readonly studentId: string;
  readonly learningTaskId: string;
}

// Slice "create and finish study sessions" — deliberadamente SIN
// `finishedAt`/`durationMinutes`: el servidor es la única autoridad
// temporal (mismo criterio ya usado por `startedAt` en
// CreateStudySessionHandler, vía el puerto `Clock`) — el cliente nunca
// envía datos de tiempo, solo identifica qué sesión finalizar.
export interface FinishStudySessionRequestDto {
  readonly studentId: string;
  readonly sessionId: string;
}
