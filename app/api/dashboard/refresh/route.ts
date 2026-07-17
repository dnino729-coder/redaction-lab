// GET /api/dashboard/refresh — Route Handler interno opcional
// (docs/modules/dashboard.md, sección 11: "solo si se requiere un botón
// explícito de 'actualizar' fuera del ciclo normal de revalidación de
// Next.js"). Consumido por features/dashboard/hooks/useDashboardData.ts
// (TanStack Query) para revalidar en el cliente tras la carga inicial por
// Server Component. Nunca expuesto como API REST pública versionada
// (sección 11: "No se expone ningún endpoint REST versionado públicamente").

import { NextResponse } from "next/server";
import { getAuthenticatedStudentId } from "@/services/auth";
import { getDashboardReadModel } from "@/features/dashboard/services";

export async function GET() {
  const studentId = await getAuthenticatedStudentId();
  if (!studentId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const readModel = await getDashboardReadModel(studentId);
  return NextResponse.json(readModel);
}
