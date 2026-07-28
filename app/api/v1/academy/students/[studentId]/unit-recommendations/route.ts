// EP-08 — POST /api/v1/academy/students/{studentId}/unit-recommendations
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleAssignUnitToStudent } from "@/features/academy/api/handlers";

export async function POST(request: NextRequest, { params }: { params: { studentId: string } }) {
  return withAcademyRoute(request, "EP-08 AssignUnitToStudent", (ctx) =>
    handleAssignUnitToStudent(request, params.studentId, ctx),
  );
}
