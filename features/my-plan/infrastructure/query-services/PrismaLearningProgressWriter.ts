import type { LearningProgressWritePort } from "@/features/my-plan/application/ports/LearningProgressWritePort";
import type { LearningProgressWriteInputDto } from "@/features/my-plan/application/dto/LearningProgressDto";
import { withActiveClient } from "../persistence/PrismaClientContext";

// Query Service (CQRS) — implementa `LearningProgressWritePort`. Mismo
// criterio que `PrismaLearningProgressReadPort.ts` (junto al que vive,
// misma tabla): `LearningProgress` no tiene Entity de dominio, así que
// esta clase NO es un Repository — escribe directamente vía Prisma, sin
// ningún Mapper de dominio (no hay ninguna Entity que mapear). `upsert`
// por `learningPlanId` (clave natural, ya `UNIQUE` en la tabla) hace esta
// escritura idempotente por construcción: repetir la misma llamada nunca
// crea una segunda fila para el mismo plan.
export class PrismaLearningProgressWriter implements LearningProgressWritePort {
  public async upsert(input: LearningProgressWriteInputDto): Promise<void> {
    await withActiveClient((client) =>
      client.learningProgress.upsert({
        where: { learningPlanId: input.learningPlanId },
        create: {
          learningPlanId: input.learningPlanId,
          completedTasks: input.completedTasks,
          totalTasks: input.totalTasks,
          completionPercentage: input.completionPercentage,
          currentStreak: input.currentStreak,
        },
        update: {
          completedTasks: input.completedTasks,
          totalTasks: input.totalTasks,
          completionPercentage: input.completionPercentage,
          currentStreak: input.currentStreak,
        },
      }),
    );
  }
}
