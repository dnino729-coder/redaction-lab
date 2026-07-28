// EP-14 — GET /api/v1/academy/units/{unitId}
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleGetUnitDetail } from "@/features/academy/api/handlers";

export async function GET(request: NextRequest, { params }: { params: { unitId: string } }) {
  return withAcademyRoute(request, "EP-14 GetAcademyUnitDetail", (ctx) =>
    handleGetUnitDetail(params.unitId, ctx),
  );
}
