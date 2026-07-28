// EP-15 — GET /api/v1/academy/continuation
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleGetContinuation } from "@/features/academy/api/handlers";

export async function GET(request: NextRequest) {
  return withAcademyRoute(request, "EP-15 GetContinuationState", (ctx) => handleGetContinuation(ctx));
}
