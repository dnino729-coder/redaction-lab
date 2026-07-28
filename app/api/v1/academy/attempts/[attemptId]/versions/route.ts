// EP-03 — POST /api/v1/academy/attempts/{attemptId}/versions
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleSubmitVersion } from "@/features/academy/api/handlers";

export async function POST(request: NextRequest, { params }: { params: { attemptId: string } }) {
  return withAcademyRoute(request, "EP-03 SubmitVersion", (ctx) =>
    handleSubmitVersion(request, params.attemptId, ctx),
  );
}
