// GET /api/v1/academy/docs — documento OpenAPI estático (Alcance #13),
// mismo path ya anticipado por la especificación Frozen de Composition
// Root (Sprint 5.3, Sección 4.9/14: "/api/v1/academy/docs"). Ruta pública:
// documentación de API, sin datos de estudiantes.
import { NextResponse } from "next/server";
import { academyOpenApiDocument } from "@/features/academy/api/openapi";

export async function GET() {
  return NextResponse.json(academyOpenApiDocument);
}
