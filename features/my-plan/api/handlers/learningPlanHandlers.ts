import type { NextResponse } from "next/server";
import { createMyPlanContainer } from "@/features/my-plan/infrastructure/composition/myPlanContainer";
import { resolveMyPlanActor } from "../http/auth";
import { jsonSuccess, jsonError } from "../http/response";

import { GetActiveLearningPlanQuery } from "@/features/my-plan/application/queries/GetActiveLearningPlanQuery";
import { PauseLearningPlanCommand } from "@/features/my-plan/application/commands/PauseLearningPlanCommand";
import { ResumeLearningPlanCommand } from "@/features/my-plan/application/commands/ResumeLearningPlanCommand";
import { CancelLearningPlanCommand } from "@/features/my-plan/application/commands/CancelLearningPlanCommand";

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

// Slice "expose learning plan lifecycle actions": Pause/Resume/Cancel
// reutilizan sus Handlers existentes (sin modificar: mismo contexto de
// transacción — service context, con ownership verificado dentro del
// propio Handler antes de cualquier `save()` — ver auditoría "Pause /
// Resume / Cancel — Post-Current-Plan-Fix Readiness Audit", sección 5).
// El cliente nunca envía `planId` ni `studentId`: ambos se resuelven aquí,
// server-side. `planId` se resuelve reutilizando
// GetActiveLearningPlanHandler (ya corregido para resolver ACTIVE|PAUSED
// como "plan actual") — exactamente el mismo patrón ya usado por
// updateStudySchedule() en studyScheduleHandlers.ts, no una abstracción
// nueva. Si el estudiante no tiene un plan actual, GetActiveLearningPlanHandler
// ya lanza ResourceNotFoundException → 404, sin necesidad de manejarlo
// aparte aquí.
async function resolveCurrentPlanId(
  container: ReturnType<typeof createMyPlanContainer>,
  studentId: string,
): Promise<string> {
  const plan = await container.handlers.getActiveLearningPlan.handle(
    GetActiveLearningPlanQuery.fromRequest({ studentId }),
  );
  return plan.id;
}

export async function pauseLearningPlan(): Promise<NextResponse> {
  try {
    const actor = await resolveMyPlanActor();
    const container = createMyPlanContainer();
    const planId = await resolveCurrentPlanId(container, actor.studentId);

    const dto = await container.handlers.pauseLearningPlan.handle(
      PauseLearningPlanCommand.fromRequest({ planId, studentId: actor.studentId }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}

export async function resumeLearningPlan(): Promise<NextResponse> {
  try {
    const actor = await resolveMyPlanActor();
    const container = createMyPlanContainer();
    const planId = await resolveCurrentPlanId(container, actor.studentId);

    const dto = await container.handlers.resumeLearningPlan.handle(
      ResumeLearningPlanCommand.fromRequest({ planId, studentId: actor.studentId }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}

export async function cancelLearningPlan(): Promise<NextResponse> {
  try {
    const actor = await resolveMyPlanActor();
    const container = createMyPlanContainer();
    const planId = await resolveCurrentPlanId(container, actor.studentId);

    const dto = await container.handlers.cancelLearningPlan.handle(
      CancelLearningPlanCommand.fromRequest({ planId, studentId: actor.studentId }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}
