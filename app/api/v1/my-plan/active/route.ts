// GET /api/v1/my-plan/active
import { getActiveLearningPlan } from "@/features/my-plan/api/handlers/learningPlanHandlers";

export async function GET() {
  return getActiveLearningPlan();
}
