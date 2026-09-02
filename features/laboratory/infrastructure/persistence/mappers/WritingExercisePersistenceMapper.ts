import type { Prisma, WritingExercise as PrismaWritingExercise } from "@prisma/client";
import { WritingExercise } from "@/features/laboratory/domain/aggregates/WritingExercise";
import { WritingExerciseId } from "@/features/laboratory/domain/value-objects/WritingExerciseId";
import { StudentId } from "@/features/laboratory/domain/value-objects/StudentId";
import { GuidedPrompt } from "@/features/laboratory/domain/value-objects/GuidedPrompt";
import type { ExerciseMode } from "@/features/laboratory/domain/enums/ExerciseMode";
import type { WritingExerciseTextType } from "@/features/laboratory/domain/enums/WritingExerciseTextType";

export class WritingExercisePersistenceMapper {
  public static toDomain(row: PrismaWritingExercise): WritingExercise {
    return WritingExercise.reconstitute(WritingExerciseId.create(row.id), {
      studentId: StudentId.create(row.studentId),
      mode: row.mode as unknown as ExerciseMode,
      textType: row.textType as unknown as WritingExerciseTextType,
      guidedPrompt: row.guidedPrompt !== null ? GuidedPrompt.create(row.guidedPrompt) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  public static toPersistence(
    exercise: WritingExercise,
  ): Prisma.WritingExerciseUncheckedCreateInput | Prisma.WritingExerciseUncheckedUpdateInput {
    return {
      id: exercise.id.value,
      studentId: exercise.studentId.value,
      mode: exercise.mode,
      textType: exercise.textType,
      guidedPrompt: exercise.guidedPrompt?.value ?? null,
      updatedAt: exercise.updatedAt,
    };
  }
}
