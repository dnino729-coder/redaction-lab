import type { LearningPlan } from "@/features/my-plan/domain/entities/LearningPlan";
import type { LearningPlanResponseDto } from "../dto/LearningPlanDto";

// Dominio → DTO. Nunca se expone la Entity `LearningPlan` fuera de la
// Application Layer — todo Handler que la lee la convierte aquí antes de
// devolverla.
export class LearningPlanMapper {
  public static toResponseDto(plan: LearningPlan): LearningPlanResponseDto {
    return {
      id: plan.id.value,
      studentId: plan.studentId.value,
      name: plan.name,
      description: plan.description,
      targetLevel: plan.targetLevel,
      startDate: plan.startDate.toISOString(),
      endDate: plan.endDate ? plan.endDate.toISOString() : null,
      status: plan.status,
    };
  }
}
