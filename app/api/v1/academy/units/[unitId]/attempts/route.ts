// EP-01 — POST /api/v1/academy/units/{unitId}/attempts
// EP-16 — GET /api/v1/academy/units/{unitId}/attempts
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleStartUnit, handleListUnitAttempts } from "@/features/academy/api/handlers";

export async function POST(request: NextRequest, { params }: { params: { unitId: string } }) {
  return withAcademyRoute(request, "EP-01 StartUnit", (ctx) =>
    handleStartUnit(request, params.unitId, ctx),
  );
}

export async function GET(request: NextRequest, { params }: { params: { unitId: string } }) {
  return withAcademyRoute(request, "EP-16 GetAttemptHistory", (ctx) =>
    handleListUnitAttempts(request, params.unitId, ctx),
  );
}
