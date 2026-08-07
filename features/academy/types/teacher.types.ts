// Blueprint §5.7.
import type { OverrideAction } from "./enums";

export interface TeacherOverrideHttp {
  overrideId: string;
  unitId: string;
  action: OverrideAction;
  reason: string;
  appliedBy: string;
  appliedAt: string;
}

export interface TeacherRecommendationHttp {
  recommendationId: string;
  studentId: string;
  unitId: string;
  recommendedBy: string;
  recommendedAt: string;
}
