// Formas de retorno propias de este puerto de lectura — no son los DTOs
// de Application (Paso 5), solo lo estrictamente necesario para que el
// contrato compile como interfaz pura.
export interface WritingExerciseListItem {
  id: string;
  mode: string;
  textType: string;
  guidedPrompt: string | null;
  status: string;
  createdAt: Date;
}

export interface WritingExerciseDetail extends WritingExerciseListItem {}

export interface ExerciseAttemptSummary {
  id: string;
  attemptNumber: number;
  status: string;
  wordCount: number;
  startedAt: Date;
  completedAt: Date | null;
}

export interface ExerciseAttemptDetail extends ExerciseAttemptSummary {
  content: string;
}

// Puerto — Read Model dedicado de CQRS: todo Query Handler de Laboratoire
// usa exclusivamente este puerto, nunca carga Aggregates ni invoca
// Repositories de escritura.
export interface LaboratoryExerciseReadModelPort {
  listExercisesForStudent(studentId: string, mode?: string): Promise<WritingExerciseListItem[]>;
  getExerciseDetail(exerciseId: string, studentId: string): Promise<WritingExerciseDetail | null>;
  getAttemptHistory(exerciseId: string, studentId: string): Promise<ExerciseAttemptSummary[]>;
  /** Ownership derivado siempre del `where` (attemptId + studentId del propio ejercicio) — nunca de un parámetro confiado del cliente. */
  getAttemptDetail(attemptId: string, studentId: string): Promise<ExerciseAttemptDetail | null>;
}
