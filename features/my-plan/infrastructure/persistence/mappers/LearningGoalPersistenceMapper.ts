import type { LearningGoalModel } from "@prisma/client";
import { LearningGoal } from "@/features/my-plan/domain/entities/LearningGoal";
import { LearningGoalId } from "@/features/my-plan/domain/value-objects/LearningGoalId";
import { LearningPlanId } from "@/features/my-plan/domain/value-objects/LearningPlanId";
import type { GoalPriority } from "@/features/my-plan/domain/enums/GoalPriority";
import type { LearningGoalStatus } from "@/features/my-plan/domain/enums/LearningGoalStatus";

// Mapper de persistencia bidireccional — fila `learning_goal`. Nota de
// nomenclatura (no es un error): la columna/enum Prisma se llama
// `priority: Priority` (schema.prisma) mientras el dominio la llama
// `GoalPriority` — mismos 4 valores (LOW/MEDIUM/HIGH/CRITICAL, ver
// comentario de `Priority` en schema.prisma: "reutilizada... 13.13"),
// asignación estructural sin conversión.
export class LearningGoalPersistenceMapper {
  public static toDomain(row: LearningGoalModel): LearningGoal {
    return LearningGoal.restore({
      id: LearningGoalId.create(row.id),
      learningPlanId: LearningPlanId.create(row.learningPlanId),
      title: row.title,
      description: row.description,
      priority: row.priority as GoalPriority,
      targetDate: row.targetDate,
      completedAt: row.completedAt,
      status: row.status as LearningGoalStatus,
    });
  }

  public static toPersistenceData(goal: LearningGoal): LearningGoalModel {
    return {
      id: goal.id.value,
      learningPlanId: goal.learningPlanId.value,
      title: goal.title,
      description: goal.description,
      priority: goal.priority,
      targetDate: goal.targetDate,
      completedAt: goal.completedAt,
      status: goal.status,
    };
  }
}
