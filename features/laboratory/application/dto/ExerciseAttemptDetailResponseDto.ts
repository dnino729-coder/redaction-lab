import type { ExerciseAttemptResponseDto } from "./ExerciseAttemptResponseDto";

export interface ExerciseAttemptDetailResponseDto extends ExerciseAttemptResponseDto {
  readonly content: string;
}
