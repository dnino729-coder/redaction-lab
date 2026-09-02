// GET /api/v1/laboratory/exercises/{exerciseId}
import type { NextRequest } from "next/server";
import { getWritingExercise } from "@/features/laboratory/api/handlers/writingExerciseHandlers";

export async function GET(_request: NextRequest, { params }: { params: { exerciseId: string } }) {
  return getWritingExercise(params.exerciseId);
}
