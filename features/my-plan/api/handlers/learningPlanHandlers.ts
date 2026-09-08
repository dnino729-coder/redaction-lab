import type { NextResponse } from "next/server";
import { createMyPlanContainer } from "@/features/my-plan/infrastructure/composition/myPlanContainer";
import { resolveMyPlanActor } from "../http/auth";
import { jsonSuccess, jsonError } from "../http/response";

import { GetActiveLearningPlanQuery } from "@/features/my-plan/application/queries/GetActiveLearningPlanQuery";

// Reutiliza el composition root ya existente
// (features/my-plan/infrastructure/composition/myPlanContainer.ts) — no
// se duplica una segunda composición "de API" como en Laboratory/Academy
// porque aquí no hace falta: el container ya vive fuera de app/, y no hay
// ninguna razón arquitectónica para tener dos.
export async function getActiveLearningPlan(): Promise<NextResponse> {
  try {
    const actor = await resolveMyPlanActor();
    const container = createMyPlanContainer();

    const dto = await container.handlers.getActiveLearningPlan.handle(
      GetActiveLearningPlanQuery.fromRequest({ studentId: actor.studentId }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}
