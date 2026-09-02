// GET /api/v1/laboratory/exercises/{exerciseId}/history
import type { NextRequest } from "next/server";
import { getExerciseHistory } from "@/features/laboratory/api/handlers/writingExerciseHandlers";

export async function GET(_request: NextRequest, { params }: { params: { exerciseId: string } }) {
  return getExerciseHistory(params.exerciseId);
}
