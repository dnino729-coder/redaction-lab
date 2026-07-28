// Health Endpoint — GET /api/v1/academy/health/liveness (Alcance #11).
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleLiveness } from "@/features/academy/api/handlers";

export async function GET(request: NextRequest) {
  return withAcademyRoute(request, "Liveness", (ctx) => handleLiveness(ctx));
}
