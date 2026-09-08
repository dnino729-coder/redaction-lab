// GET /api/v1/my-plan/progress
import { getLearningProgress } from "@/features/my-plan/api/handlers/progressHandlers";

export async function GET() {
  return getLearningProgress();
}
