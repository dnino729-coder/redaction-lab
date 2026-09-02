export interface CreateWritingExerciseRequestDto {
  readonly studentId: string;
  readonly mode: string;
  readonly textType: string;
  readonly guidedPrompt?: string | null;
}
