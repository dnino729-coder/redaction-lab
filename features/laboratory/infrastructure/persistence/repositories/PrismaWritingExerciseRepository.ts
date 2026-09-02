import type { Prisma } from "@prisma/client";
import type { WritingExerciseRepository } from "@/features/laboratory/domain/repositories/WritingExerciseRepository";
import type { WritingExercise } from "@/features/laboratory/domain/aggregates/WritingExercise";
import type { WritingExerciseId } from "@/features/laboratory/domain/value-objects/WritingExerciseId";
import type { StudentId } from "@/features/laboratory/domain/value-objects/StudentId";
import type { ExerciseMode } from "@/features/laboratory/domain/enums/ExerciseMode";

import { withActiveClient } from "../PrismaClientContext";
import { WritingExercisePersistenceMapper } from "../mappers/WritingExercisePersistenceMapper";
import { translatePersistenceError } from "@/features/laboratory/infrastructure/exceptions/PrismaExceptionTranslator";

export class PrismaWritingExerciseRepository implements WritingExerciseRepository {
  public async findById(id: WritingExerciseId): Promise<WritingExercise | null> {
    const row = await withActiveClient((client) => client.writingExercise.findUnique({ where: { id: id.value } }));
    return row ? WritingExercisePersistenceMapper.toDomain(row) : null;
  }

  public async findAllByStudentId(studentId: StudentId, mode?: ExerciseMode): Promise<WritingExercise[]> {
    const rows = await withActiveClient((client) =>
      client.writingExercise.findMany({
        where: {
          studentId: studentId.value,
          ...(mode ? { mode } : {}),
        },
        orderBy: { createdAt: "desc" },
      }),
    );
    return rows.map((row) => WritingExercisePersistenceMapper.toDomain(row));
  }

  public async save(exercise: WritingExercise): Promise<void> {
    const data = WritingExercisePersistenceMapper.toPersistence(exercise);
    try {
      await withActiveClient((client) =>
        client.writingExercise.upsert({
          where: { id: exercise.id.value },
          create: data as Prisma.WritingExerciseUncheckedCreateInput,
          update: data as Prisma.WritingExerciseUncheckedUpdateInput,
        }),
      );
    } catch (error) {
      translatePersistenceError(error, "WritingExercise", exercise.id.value);
    }
  }
}
