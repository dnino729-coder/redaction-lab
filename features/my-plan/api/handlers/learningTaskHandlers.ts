import type { NextResponse } from "next/server";
import { createMyPlanContainer } from "@/features/my-plan/infrastructure/composition/myPlanContainer";
import { resolveMyPlanActor } from "../http/auth";
import { jsonSuccess, jsonError } from "../http/response";

import { CompleteLearningTaskCommand } from "@/features/my-plan/application/commands/CompleteLearningTaskCommand";

// Mismo patrón que studySessionHandlers.ts/learningPhasesHandlers.ts:
// reutiliza el composition root existente (`completeLearningTask` ya
// registrado, sin cambios) — no duplica la lógica de negocio de
// CompleteLearningTaskHandler, que permanece sin modificar. `actor.studentId`
// (resuelto desde la sesión Clerk verificada) es el único origen del
// studentId — el cliente nunca lo envía. `taskId` viene del segmento
// dinámico de la URL; ownership real la verifica el Handler, no esta capa.
export async function completeLearningTask(taskId: string): Promise<NextResponse> {
  try {
    const actor = await resolveMyPlanActor();
    const container = createMyPlanContainer();

    const dto = await container.handlers.completeLearningTask.handle(
      CompleteLearningTaskCommand.fromRequest({ studentId: actor.studentId, taskId }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}
