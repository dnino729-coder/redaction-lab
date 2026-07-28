// EP-06 — POST /api/v1/academy/units/{unitId}/repetitions
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleRepeatUnit } from "@/features/academy/api/handlers";

export async function POST(request: NextRequest, { params }: { params: { unitId: string } }) {
  return withAcademyRoute(request, "EP-06 RepeatUnit", (ctx) =>
    handleRepeatUnit(request, params.unitId, ctx),
  );
}
