import type { Prisma, ExerciseAttempt as PrismaExerciseAttempt } from "@prisma/client";
import { ExerciseAttempt } from "@/features/laboratory/domain/aggregates/ExerciseAttempt";
import { ExerciseAttemptId } from "@/features/laboratory/domain/value-objects/ExerciseAttemptId";
import { WritingExerciseId } from "@/features/laboratory/domain/value-objects/WritingExerciseId";
import { AttemptNumber } from "@/features/laboratory/domain/value-objects/AttemptNumber";
import { WordCount } from "@/features/laboratory/domain/value-objects/WordCount";
import type { ExerciseAttemptStatus } from "@/features/laboratory/domain/enums/ExerciseAttemptStatus";

export class ExerciseAttemptPersistenceMapper {
  public static toDomain(row: PrismaExerciseAttempt): ExerciseAttempt {
    return ExerciseAttempt.reconstitute(ExerciseAttemptId.create(row.id), {
      writingExerciseId: WritingExerciseId.create(row.writingExerciseId),
      attemptNumber: AttemptNumber.create(row.attemptNumber),
      status: row.status as unknown as ExerciseAttemptStatus,
      content: row.content,
      wordCount: WordCount.reconstitute(row.wordCount),
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  public static toPersistence(
    attempt: ExerciseAttempt,
  ): Prisma.ExerciseAttemptUncheckedCreateInput | Prisma.ExerciseAttemptUncheckedUpdateInput {
    return {
      id: attempt.id.value,
      writingExerciseId: attempt.writingExerciseId.value,
      attemptNumber: attempt.attemptNumber.value,
      status: attempt.status,
      content: attempt.content,
      wordCount: attempt.wordCount.value,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      updatedAt: attempt.updatedAt,
    };
  }
}
