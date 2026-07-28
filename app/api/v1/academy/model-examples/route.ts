// EP-09 — POST /api/v1/academy/model-examples
// EP-19 — GET /api/v1/academy/model-examples
import type { NextRequest } from "next/server";
import { withAcademyRoute } from "@/features/academy/api/http";
import { handleCreateModelExample, handleListModelExamples } from "@/features/academy/api/handlers";

export async function POST(request: NextRequest) {
  return withAcademyRoute(request, "EP-09 CreateModelExample", (ctx) =>
    handleCreateModelExample(request, ctx),
  );
}

export async function GET(request: NextRequest) {
  return withAcademyRoute(request, "EP-19 ListModelExamplesByTextType", (ctx) =>
    handleListModelExamples(request, ctx),
  );
}
