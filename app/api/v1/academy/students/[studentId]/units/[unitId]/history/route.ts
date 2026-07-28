// EP-23 — GET /api/v1/academy/students/{studentId}/units/{unitId}/history
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleGetStudentUnitHistory } from "@/features/academy/api/handlers";

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string; unitId: string } },
) {
  return withAcademyRoute(request, "EP-23 GetStudentUnitHistory", (ctx) =>
    handleGetStudentUnitHistory(params.studentId, params.unitId, ctx),
  );
}
