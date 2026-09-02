export interface WritingExerciseResponseDto {
  readonly id: string;
  readonly mode: string;
  readonly textType: string;
  readonly guidedPrompt: string | null;
  readonly status: string;
  readonly createdAt: string;
}
