// EP-13 — GET /api/v1/academy/units (API Contract v1.3). Route Handler
// delgado — toda la lógica vive en features/academy/api/ (Alcance del
// encargo, "features/academy/api/"), este archivo solo conecta la ruta de
// Next.js App Router con esa lógica (requisito técnico: Next.js exige que
// los Route Handlers vivan físicamente bajo `app/`).
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleListUnits } from "@/features/academy/api/handlers";

export async function GET(request: NextRequest) {
  return withAcademyRoute(request, "EP-13 ListAcademyUnitsForStudent", (ctx) =>
    handleListUnits(request, ctx),
  );
}
