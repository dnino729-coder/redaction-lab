// EP-21 — PATCH /api/v1/academy/attempts/{attemptId}/step
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleAdvanceStep } from "@/features/academy/api/handlers";

export async function PATCH(request: NextRequest, { params }: { params: { attemptId: string } }) {
  return withAcademyRoute(request, "EP-21 AdvanceStep", (ctx) =>
    handleAdvanceStep(request, params.attemptId, ctx),
  );
}
