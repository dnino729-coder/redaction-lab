// EP-05 — POST /api/v1/academy/attempts/{attemptId}/reflection
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleCompleteReflection } from "@/features/academy/api/handlers";

export async function POST(request: NextRequest, { params }: { params: { attemptId: string } }) {
  return withAcademyRoute(request, "EP-05 CompleteReflection", (ctx) =>
    handleCompleteReflection(request, params.attemptId, ctx),
  );
}
