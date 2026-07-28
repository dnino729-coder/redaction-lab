// EP-22 — POST /api/v1/academy/attempts/{attemptId}/comprehension
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleVerifyComprehension } from "@/features/academy/api/handlers";

export async function POST(request: NextRequest, { params }: { params: { attemptId: string } }) {
  return withAcademyRoute(request, "EP-22 VerifyComprehension", (ctx) =>
    handleVerifyComprehension(request, params.attemptId, ctx),
  );
}
