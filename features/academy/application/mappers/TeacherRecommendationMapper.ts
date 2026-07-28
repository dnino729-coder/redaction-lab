import type { TeacherRecommendation } from "@/features/academy/domain/entities/TeacherRecommendation";
import type { TeacherRecommendationResponseDto } from "../dto";

export class TeacherRecommendationMapper {
  public static toDto(recommendation: TeacherRecommendation): TeacherRecommendationResponseDto {
    return {
      id: recommendation.id.value,
      unitId: recommendation.unitId,
      studentId: recommendation.studentId,
      teacherId: recommendation.teacherId,
      recommendedAt: recommendation.recommendedAt.toISOString(),
    };
  }
}
