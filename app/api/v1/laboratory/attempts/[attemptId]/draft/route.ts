// PATCH /api/v1/laboratory/attempts/{attemptId}/draft
import type { NextRequest } from "next/server";
import { autosaveExerciseDraft } from "@/features/laboratory/api/handlers/exerciseAttemptHandlers";

export async function PATCH(request: NextRequest, { params }: { params: { attemptId: string } }) {
  return autosaveExerciseDraft(request, params.attemptId);
}
