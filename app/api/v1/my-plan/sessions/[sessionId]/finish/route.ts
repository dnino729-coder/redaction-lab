// POST /api/v1/my-plan/sessions/{sessionId}/finish
import type { NextRequest } from "next/server";
import { finishStudySession } from "@/features/my-plan/api/handlers/studySessionHandlers";

export async function POST(_request: NextRequest, { params }: { params: { sessionId: string } }) {
  return finishStudySession(params.sessionId);
}
