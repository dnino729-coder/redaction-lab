// POST /api/v1/my-plan/cancel
import { cancelLearningPlan } from "@/features/my-plan/api/handlers/learningPlanHandlers";

export async function POST() {
  return cancelLearningPlan();
}
