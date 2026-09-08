import type { NextResponse } from "next/server";
import { createMyPlanContainer } from "@/features/my-plan/infrastructure/composition/myPlanContainer";
import { resolveMyPlanActor } from "../http/auth";
import { jsonSuccess, jsonError } from "../http/response";

import { GetLearningGoalsQuery } from "@/features/my-plan/application/queries/GetLearningGoalsQuery";

// Mismo patrón que learningPlanHandlers.ts/studyScheduleHandlers.ts/
// progressHandlers.ts (vertical slices 1-3): reutiliza el composition root
// existente, sin duplicar infraestructura. `actor.studentId` (resuelto
// desde la sesión Clerk verificada) es el único origen del studentId — el
// cliente nunca puede enviar un learningPlanId ni un studentId propio.
export async function getLearningGoals(): Promise<NextResponse> {
  try {
    const actor = await resolveMyPlanActor();
    const container = createMyPlanContainer();

    const dto = await container.handlers.getLearningGoals.handle(
      GetLearningGoalsQuery.fromRequest({ studentId: actor.studentId }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}
