// POST /api/v1/my-plan/resume
import { resumeLearningPlan } from "@/features/my-plan/api/handlers/learningPlanHandlers";

export async function POST() {
  return resumeLearningPlan();
}
