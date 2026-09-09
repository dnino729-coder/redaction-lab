import type { NextResponse } from "next/server";
import { createMyPlanContainer } from "@/features/my-plan/infrastructure/composition/myPlanContainer";
import { resolveMyPlanActor } from "../http/auth";
import { jsonSuccess, jsonError } from "../http/response";

import { GetStudyScheduleQuery } from "@/features/my-plan/application/queries/GetStudyScheduleQuery";
import { GetActiveLearningPlanQuery } from "@/features/my-plan/application/queries/GetActiveLearningPlanQuery";
import { UpdateStudyScheduleCommand } from "@/features/my-plan/application/commands/UpdateStudyScheduleCommand";

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

interface UpdateStudyScheduleBody {
  daysPerWeek?: unknown;
  sessionsPerDay?: unknown;
  minutesPerSession?: unknown;
  reminderHour?: unknown;
  reminderMinute?: unknown;
}

// Slice "update study schedule": reutiliza UpdateStudyScheduleHandler
// (sin modificar) tal cual — su Command exige `planId` (a diferencia de
// GetStudyScheduleQuery, que solo necesita `studentId` y resuelve el plan
// activo internamente), así que esta capa resuelve primero el plan activo
// del estudiante autenticado vía GetActiveLearningPlanHandler (ya
// existente, ya probado, mismo patrón de composición que el resto de esta
// capa) para obtener su `id` — el cliente nunca envía `studentId` ni
// `planId`, ambos se resuelven aquí, server-side, a partir de la sesión
// Clerk ya verificada por resolveMyPlanActor(). Mismo patrón de parseo de
// body que features/profile/api/handlers/onboardingHandlers.ts (campos
// `unknown`, casteados explícitamente al construir el Command — la
// validación real la hace `validateUpdateStudyScheduleRequest`, sin
// modificar).
export async function updateStudySchedule(request: Request): Promise<NextResponse> {
  try {
    const actor = await resolveMyPlanActor();
    const container = createMyPlanContainer();
    const body = (await request.json()) as UpdateStudyScheduleBody;

    const activePlan = await container.handlers.getActiveLearningPlan.handle(
      GetActiveLearningPlanQuery.fromRequest({ studentId: actor.studentId }),
    );

    const dto = await container.handlers.updateStudySchedule.handle(
      UpdateStudyScheduleCommand.fromRequest({
        studentId: actor.studentId,
        planId: activePlan.id,
        daysPerWeek: body.daysPerWeek as number,
        sessionsPerDay: body.sessionsPerDay as number,
        minutesPerSession: body.minutesPerSession as number,
        reminderHour: (body.reminderHour as number | null | undefined) ?? undefined,
        reminderMinute: (body.reminderMinute as number | null | undefined) ?? undefined,
      }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}
