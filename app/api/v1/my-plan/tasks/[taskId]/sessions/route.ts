// POST /api/v1/my-plan/tasks/{taskId}/sessions
import type { NextRequest } from "next/server";
import { createStudySession } from "@/features/my-plan/api/handlers/studySessionHandlers";

export async function POST(_request: NextRequest, { params }: { params: { taskId: string } }) {
  return createStudySession(params.taskId);
}
