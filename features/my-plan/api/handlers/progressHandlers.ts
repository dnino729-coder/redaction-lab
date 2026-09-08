import type { NextResponse } from "next/server";
import { createMyPlanContainer } from "@/features/my-plan/infrastructure/composition/myPlanContainer";
import { resolveMyPlanActor } from "../http/auth";
import { jsonSuccess, jsonError } from "../http/response";

import { GetLearningProgressQuery } from "@/features/my-plan/application/queries/GetLearningProgressQuery";

// Mismo patrón que learningPlanHandlers.ts/studyScheduleHandlers.ts
// (vertical slices 1 y 2): reutiliza el composition root existente, sin
// duplicar infraestructura.
export async function getLearningProgress(): Promise<NextResponse> {
  try {
    const actor = await resolveMyPlanActor();
    const container = createMyPlanContainer();

    const dto = await container.handlers.getLearningProgress.handle(
      GetLearningProgressQuery.fromRequest({ studentId: actor.studentId }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}
