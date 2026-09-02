import type { Prisma, ExerciseMode } from "@prisma/client";
import type {
  LaboratoryExerciseReadModelPort,
  WritingExerciseListItem,
  WritingExerciseDetail,
  ExerciseAttemptSummary,
} from "@/features/laboratory/application/ports/LaboratoryExerciseReadModelPort";

import { withActiveClient } from "../PrismaClientContext";

const LATEST_ATTEMPT_INCLUDE = {
  attempts: { orderBy: { attemptNumber: "desc" as const }, take: 1 },
} satisfies Prisma.WritingExerciseInclude;

function deriveStatus(latestAttemptStatus: string | undefined): string {
  return latestAttemptStatus ?? "NOT_STARTED";
}

// Proyecta filas Prisma directamente a las formas de retorno del puerto
// (Paso 4) — nunca reconstituye Aggregates de dominio, solo usa
// writing_exercise/exercise_attempt.
export class PrismaLaboratoryExerciseReadModelPort implements LaboratoryExerciseReadModelPort {
  public async listExercisesForStudent(studentId: string, mode?: string): Promise<WritingExerciseListItem[]> {
    const rows = await withActiveClient((client) =>
      client.writingExercise.findMany({
        where: {
          studentId,
          ...(mode ? { mode: mode as ExerciseMode } : {}),
        },
        include: LATEST_ATTEMPT_INCLUDE,
        orderBy: { createdAt: "desc" },
      }),
    );

    return rows.map((row) => ({
      id: row.id,
      mode: row.mode,
      textType: row.textType,
      guidedPrompt: row.guidedPrompt,
      status: deriveStatus(row.attempts[0]?.status),
      createdAt: row.createdAt,
    }));
  }

  public async getExerciseDetail(exerciseId: string, studentId: string): Promise<WritingExerciseDetail | null> {
    const row = await withActiveClient((client) =>
      client.writingExercise.findFirst({
        where: { id: exerciseId, studentId },
        include: LATEST_ATTEMPT_INCLUDE,
      }),
    );
    if (!row) return null;

    return {
      id: row.id,
      mode: row.mode,
      textType: row.textType,
      guidedPrompt: row.guidedPrompt,
      status: deriveStatus(row.attempts[0]?.status),
      createdAt: row.createdAt,
    };
  }

  public async getAttemptHistory(exerciseId: string, studentId: string): Promise<ExerciseAttemptSummary[]> {
    const rows = await withActiveClient((client) =>
      client.exerciseAttempt.findMany({
        where: { writingExerciseId: exerciseId, writingExercise: { studentId } },
        orderBy: { attemptNumber: "asc" },
      }),
    );

    return rows.map((row) => ({
      id: row.id,
      attemptNumber: row.attemptNumber,
      status: row.status,
      wordCount: row.wordCount,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
    }));
  }
}
