// POST /api/v1/laboratory/exercises/{exerciseId}/attempts
import type { NextRequest } from "next/server";
import { startExerciseAttempt } from "@/features/laboratory/api/handlers/exerciseAttemptHandlers";

export async function POST(request: NextRequest, { params }: { params: { exerciseId: string } }) {
  return startExerciseAttempt(request, params.exerciseId);
}
