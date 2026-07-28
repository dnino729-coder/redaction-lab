// EP-12 — GET /api/v1/academy/progress-summary
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleGetMyProgressSummary } from "@/features/academy/api/handlers";

export async function GET(request: NextRequest) {
  return withAcademyRoute(request, "EP-12 GetStudentProgressSummary", (ctx) =>
    handleGetMyProgressSummary(ctx),
  );
}
