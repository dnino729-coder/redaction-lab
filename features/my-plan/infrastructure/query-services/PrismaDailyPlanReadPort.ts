import type { DailyPlanReadPort } from "@/features/my-plan/application/ports/DailyPlanReadPort";
import type { DailyPlanReadModel } from "@/features/my-plan/application/dto/DailyPlanDto";
import { withActiveClient } from "../persistence/PrismaClientContext";

// Query Service (CQRS) — implementa `DailyPlanReadPort` (Application
// Layer, Sprint 3.3.3). `DailyPlan` no tiene Entity de dominio (decisión
// ya cerrada en 18.23/Sprint 3.3.2/3.3.3: es un resumen agregado de solo
// lectura) — por eso esta clase NO es un Repository ("No utilizar
// repositorios para consultas complejas"): lee directamente de Prisma y
// devuelve el DTO de lectura, sin pasar por ningún Mapper de dominio.
export class PrismaDailyPlanReadPort implements DailyPlanReadPort {
  public async findByLearningPlanIdAndDate(
    learningPlanId: string,
    date: Date,
  ): Promise<DailyPlanReadModel | null> {
    const row = await withActiveClient((client) =>
      client.dailyPlan.findFirst({
        where: { learningPlanId, planDate: date },
      }),
    );
    if (!row) return null;

    return {
      id: row.id,
      learningPlanId: row.learningPlanId,
      planDate: row.planDate.toISOString(),
      estimatedMinutes: row.estimatedMinutes,
      completedMinutes: row.completedMinutes,
      completionPercentage: row.completionPercentage.toNumber(),
    };
  }
}
