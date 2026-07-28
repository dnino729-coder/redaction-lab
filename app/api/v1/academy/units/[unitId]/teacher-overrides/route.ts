// EP-07 — POST /api/v1/academy/units/{unitId}/teacher-overrides
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleApplyTeacherOverride } from "@/features/academy/api/handlers";

export async function POST(request: NextRequest, { params }: { params: { unitId: string } }) {
  return withAcademyRoute(request, "EP-07 ApplyTeacherOverride", (ctx) =>
    handleApplyTeacherOverride(request, params.unitId, ctx),
  );
}
