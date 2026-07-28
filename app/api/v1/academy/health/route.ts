// Health Endpoint — GET /api/v1/academy/health (Alcance #11). Ruta pública
// (ver middleware/auth.ts, patrón "/api/v1/academy/health(.*)" añadido en
// este Sprint) — nunca exige JWT, consistente con `/api/health` ya
// existente a nivel de plataforma.
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleHealth } from "@/features/academy/api/handlers";

export async function GET(request: NextRequest) {
  return withAcademyRoute(request, "Health", (ctx) => handleHealth(ctx));
}
