// EP-04 — PATCH /api/v1/academy/attempts/{attemptId}/phase
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleAdvancePhase } from "@/features/academy/api/handlers";

export async function PATCH(request: NextRequest, { params }: { params: { attemptId: string } }) {
  return withAcademyRoute(request, "EP-04 AdvancePhase", (ctx) =>
    handleAdvancePhase(request, params.attemptId, ctx),
  );
}
