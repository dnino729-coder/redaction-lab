// GET /api/v1/my-plan/phases
import { getLearningPhases } from "@/features/my-plan/api/handlers/learningPhasesHandlers";

export async function GET() {
  return getLearningPhases();
}
