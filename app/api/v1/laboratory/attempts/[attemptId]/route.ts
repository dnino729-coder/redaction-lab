// GET /api/v1/laboratory/attempts/{attemptId}
import type { NextRequest } from "next/server";
import { getExerciseAttempt } from "@/features/laboratory/api/handlers/exerciseAttemptHandlers";

export async function GET(_request: NextRequest, { params }: { params: { attemptId: string } }) {
  return getExerciseAttempt(params.attemptId);
}
