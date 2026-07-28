// EP-02 — PUT /api/v1/academy/attempts/{attemptId}/draft
// EP-17 — GET /api/v1/academy/attempts/{attemptId}/draft
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleAutosaveDraft, handleGetDraft } from "@/features/academy/api/handlers";

export async function PUT(request: NextRequest, { params }: { params: { attemptId: string } }) {
  return withAcademyRoute(request, "EP-02 AutosaveDraft", (ctx) =>
    handleAutosaveDraft(request, params.attemptId, ctx),
  );
}

export async function GET(request: NextRequest, { params }: { params: { attemptId: string } }) {
  return withAcademyRoute(request, "EP-17 GetDraft", (ctx) => handleGetDraft(params.attemptId, ctx));
}
