import type { WritingExerciseResponseDto } from "./WritingExerciseResponseDto";
import type { ExerciseAttemptResponseDto } from "./ExerciseAttemptResponseDto";

export interface ExerciseHistoryResponseDto {
  readonly exercise: WritingExerciseResponseDto;
  readonly attempts: readonly ExerciseAttemptResponseDto[];
}
