import type { NextResponse } from "next/server";
import { createMyPlanContainer } from "@/features/my-plan/infrastructure/composition/myPlanContainer";
import { resolveMyPlanActor } from "../http/auth";
import { jsonSuccess, jsonError } from "../http/response";

import { GetLearningPhasesQuery } from "@/features/my-plan/application/queries/GetLearningPhasesQuery";

// Mismo patrón que learningGoalsHandlers.ts (vertical slice "connect goals
// and objectives"): reutiliza el composition root existente, sin duplicar
// infraestructura. `actor.studentId` (resuelto desde la sesión Clerk
// verificada) es el único origen del studentId — el cliente nunca puede
// enviar un learningPlanId ni un studentId propio.
export async function getLearningPhases(): Promise<NextResponse> {
  try {
    const actor = await resolveMyPlanActor();
    const container = createMyPlanContainer();

    const dto = await container.handlers.getLearningPhases.handle(
      GetLearningPhasesQuery.fromRequest({ studentId: actor.studentId }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}
