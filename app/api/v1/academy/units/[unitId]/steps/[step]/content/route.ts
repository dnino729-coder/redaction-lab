// Academy Content v1 (Bloque 3A) — GET /api/v1/academy/units/{unitId}/steps/{step}/content
// Endpoint nuevo, no forma parte de los 23 endpoints del API Contract
// v1.3 original — ver features/academy/api/handlers/unitsHandlers.ts,
// handleGetUnitStepContent, para el detalle de diseño (locale por query
// string, sin tocar middleware.ts/next-intl).
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleGetUnitStepContent } from "@/features/academy/api/handlers";

export async function GET(
  request: NextRequest,
  { params }: { params: { unitId: string; step: string } },
) {
  return withAcademyRoute(request, "GetUnitStepContent", (ctx) =>
    handleGetUnitStepContent(request, params.unitId, params.step, ctx),
  );
}
