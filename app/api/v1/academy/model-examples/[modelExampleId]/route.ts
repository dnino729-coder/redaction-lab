// EP-10 — PATCH /api/v1/academy/model-examples/{modelExampleId}
// EP-11 — DELETE /api/v1/academy/model-examples/{modelExampleId}
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleUpdateModelExample, handleRetireModelExample } from "@/features/academy/api/handlers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { modelExampleId: string } },
) {
  return withAcademyRoute(request, "EP-10 UpdateModelExample", (ctx) =>
    handleUpdateModelExample(request, params.modelExampleId, ctx),
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { modelExampleId: string } },
) {
  return withAcademyRoute(request, "EP-11 RetireModelExample", (ctx) =>
    handleRetireModelExample(params.modelExampleId, ctx),
  );
}
