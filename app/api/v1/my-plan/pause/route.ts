// POST /api/v1/my-plan/pause
import { pauseLearningPlan } from "@/features/my-plan/api/handlers/learningPlanHandlers";

export async function POST() {
  return pauseLearningPlan();
}
