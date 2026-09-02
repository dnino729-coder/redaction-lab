import { WritingExercise } from "../aggregates/WritingExercise";
import { WritingExerciseId } from "../value-objects/WritingExerciseId";
import { StudentId } from "../value-objects/StudentId";
import { GuidedPrompt } from "../value-objects/GuidedPrompt";
import type { ExerciseMode } from "../enums/ExerciseMode";
import type { WritingExerciseTextType } from "../enums/WritingExerciseTextType";

export interface CreateWritingExerciseInput {
  newId: () => string;
  studentId: string;
  mode: ExerciseMode;
  textType: WritingExerciseTextType;
  guidedPrompt: string | null;
}

export class WritingExerciseFactory {
  public create(input: CreateWritingExerciseInput): WritingExercise {
    return WritingExercise.create({
      id: WritingExerciseId.create(input.newId()),
      studentId: StudentId.create(input.studentId),
      mode: input.mode,
      textType: input.textType,
      guidedPrompt: input.guidedPrompt !== null ? GuidedPrompt.create(input.guidedPrompt) : null,
    });
  }
}
