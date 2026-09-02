import type { Prisma } from "@prisma/client";
import type { ExerciseAttemptRepository } from "@/features/laboratory/domain/repositories/ExerciseAttemptRepository";
import type { ExerciseAttempt } from "@/features/laboratory/domain/aggregates/ExerciseAttempt";
import type { ExerciseAttemptId } from "@/features/laboratory/domain/value-objects/ExerciseAttemptId";
import type { WritingExerciseId } from "@/features/laboratory/domain/value-objects/WritingExerciseId";
import { ExerciseAttemptStatus } from "@/features/laboratory/domain/enums/ExerciseAttemptStatus";

import { withActiveClient } from "../PrismaClientContext";
import { ExerciseAttemptPersistenceMapper } from "../mappers/ExerciseAttemptPersistenceMapper";
import { translatePersistenceError } from "@/features/laboratory/infrastructure/exceptions/PrismaExceptionTranslator";

export class PrismaExerciseAttemptRepository implements ExerciseAttemptRepository {
  public async findById(id: ExerciseAttemptId): Promise<ExerciseAttempt | null> {
    const row = await withActiveClient((client) => client.exerciseAttempt.findUnique({ where: { id: id.value } }));
    return row ? ExerciseAttemptPersistenceMapper.toDomain(row) : null;
  }

  public async findActiveByExerciseId(exerciseId: WritingExerciseId): Promise<ExerciseAttempt | null> {
    const row = await withActiveClient((client) =>
      client.exerciseAttempt.findFirst({
        where: { writingExerciseId: exerciseId.value, status: ExerciseAttemptStatus.IN_PROGRESS },
      }),
    );
    return row ? ExerciseAttemptPersistenceMapper.toDomain(row) : null;
  }

  public async findAllByExerciseId(exerciseId: WritingExerciseId): Promise<ExerciseAttempt[]> {
    const rows = await withActiveClient((client) =>
      client.exerciseAttempt.findMany({
        where: { writingExerciseId: exerciseId.value },
        orderBy: { attemptNumber: "asc" },
      }),
    );
    return rows.map((row) => ExerciseAttemptPersistenceMapper.toDomain(row));
  }

  public async getNextAttemptNumber(exerciseId: WritingExerciseId): Promise<number> {
    const result = await withActiveClient((client) =>
      client.exerciseAttempt.aggregate({
        where: { writingExerciseId: exerciseId.value },
        _max: { attemptNumber: true },
      }),
    );
    return (result._max.attemptNumber ?? 0) + 1;
  }

  public async save(attempt: ExerciseAttempt): Promise<void> {
    const data = ExerciseAttemptPersistenceMapper.toPersistence(attempt);
    try {
      await withActiveClient((client) =>
        client.exerciseAttempt.upsert({
          where: { id: attempt.id.value },
          create: data as Prisma.ExerciseAttemptUncheckedCreateInput,
          update: data as Prisma.ExerciseAttemptUncheckedUpdateInput,
        }),
      );
    } catch (error) {
      translatePersistenceError(error, "ExerciseAttempt", attempt.id.value);
    }
  }
}
