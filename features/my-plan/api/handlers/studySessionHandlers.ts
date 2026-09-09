import type { NextResponse } from "next/server";
import { createMyPlanContainer } from "@/features/my-plan/infrastructure/composition/myPlanContainer";
import { resolveMyPlanActor } from "../http/auth";
import { jsonSuccess, jsonError } from "../http/response";

import { CreateStudySessionCommand } from "@/features/my-plan/application/commands/CreateStudySessionCommand";
import { FinishStudySessionCommand } from "@/features/my-plan/application/commands/FinishStudySessionCommand";

// Mismo patrón que learningGoalsHandlers.ts/learningPhasesHandlers.ts:
// reutiliza el composition root existente, sin duplicar infraestructura.
// `actor.studentId` (resuelto desde la sesión Clerk verificada) es el
// único origen del studentId — el cliente nunca lo envía. `taskId`/
// `sessionId` vienen del segmento dinámico de la URL (ownership real la
// verifica el Handler, no esta capa — ver CreateStudySessionHandler/
// FinishStudySessionHandler).
export async function createStudySession(taskId: string): Promise<NextResponse> {
  try {
    const actor = await resolveMyPlanActor();
    const container = createMyPlanContainer();

    const dto = await container.handlers.createStudySession.handle(
      CreateStudySessionCommand.fromRequest({ studentId: actor.studentId, learningTaskId: taskId }),
    );
    return jsonSuccess(dto, 201);
  } catch (error) {
    return jsonError(error);
  }
}

// Sin body: el cliente nunca envía `finishedAt`/`durationMinutes` — el
// servidor es la única autoridad temporal (ver FinishStudySessionHandler).
export async function finishStudySession(sessionId: string): Promise<NextResponse> {
  try {
    const actor = await resolveMyPlanActor();
    const container = createMyPlanContainer();

    const dto = await container.handlers.finishStudySession.handle(
      FinishStudySessionCommand.fromRequest({ studentId: actor.studentId, sessionId }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}
