import type { NextResponse } from "next/server";
import { createMyPlanContainer } from "@/features/my-plan/infrastructure/composition/myPlanContainer";
import { resolveMyPlanActor } from "../http/auth";
import { jsonSuccess, jsonError } from "../http/response";

import { GetStudyScheduleQuery } from "@/features/my-plan/application/queries/GetStudyScheduleQuery";

// Mismo patrón que learningPlanHandlers.ts (vertical slice 1): reutiliza
// el composition root existente, sin duplicar infraestructura.
export async function getStudySchedule(): Promise<NextResponse> {
  try {
    const actor = await resolveMyPlanActor();
    const container = createMyPlanContainer();

    const dto = await container.handlers.getStudySchedule.handle(
      GetStudyScheduleQuery.fromRequest({ studentId: actor.studentId }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}
