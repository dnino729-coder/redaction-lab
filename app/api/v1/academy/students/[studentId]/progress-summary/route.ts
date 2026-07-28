// EP-20 — GET /api/v1/academy/students/{studentId}/progress-summary
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleGetStudentProgressSummary } from "@/features/academy/api/handlers";

export async function GET(request: NextRequest, { params }: { params: { studentId: string } }) {
  return withAcademyRoute(request, "EP-20 GetStudentProgressSummary", (ctx) =>
    handleGetStudentProgressSummary(params.studentId, ctx),
  );
}
