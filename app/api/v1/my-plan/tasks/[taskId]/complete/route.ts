// POST /api/v1/my-plan/tasks/{taskId}/complete
import type { NextRequest } from "next/server";
import { completeLearningTask } from "@/features/my-plan/api/handlers/learningTaskHandlers";

export async function POST(_request: NextRequest, { params }: { params: { taskId: string } }) {
  return completeLearningTask(params.taskId);
}
