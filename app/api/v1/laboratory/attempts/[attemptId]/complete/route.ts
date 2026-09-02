// POST /api/v1/laboratory/attempts/{attemptId}/complete
import type { NextRequest } from "next/server";
import { completeExerciseAttempt } from "@/features/laboratory/api/handlers/exerciseAttemptHandlers";

export async function POST(request: NextRequest, { params }: { params: { attemptId: string } }) {
  return completeExerciseAttempt(request, params.attemptId);
}
