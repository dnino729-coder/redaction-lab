// EP-18 — GET /api/v1/academy/attempts/{attemptId}/feedback
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleGetFeedback } from "@/features/academy/api/handlers";

export async function GET(request: NextRequest, { params }: { params: { attemptId: string } }) {
  return withAcademyRoute(request, "EP-18 GetVersionFeedback", (ctx) =>
    handleGetFeedback(request, params.attemptId, ctx),
  );
}
