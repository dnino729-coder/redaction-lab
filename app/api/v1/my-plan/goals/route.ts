// GET /api/v1/my-plan/goals
import { getLearningGoals } from "@/features/my-plan/api/handlers/learningGoalsHandlers";

export async function GET() {
  return getLearningGoals();
}
