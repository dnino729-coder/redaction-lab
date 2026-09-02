import type { NextResponse } from "next/server";
import { createLaboratoryContainer } from "../composition/laboratoryContainer";
import { resolveLaboratoryActor } from "../http/auth";
import { requireIdempotencyKey } from "../http/idempotency";
import { jsonSuccess, jsonError } from "../http/response";

import { StartExerciseAttemptCommand } from "@/features/laboratory/application/commands/StartExerciseAttemptCommand";
import { AutosaveExerciseDraftCommand } from "@/features/laboratory/application/commands/AutosaveExerciseDraftCommand";
import { CompleteExerciseAttemptCommand } from "@/features/laboratory/application/commands/CompleteExerciseAttemptCommand";

export async function startExerciseAttempt(request: Request, exerciseId: string): Promise<NextResponse> {
  try {
    requireIdempotencyKey(request);
    const actor = await resolveLaboratoryActor();
    const container = createLaboratoryContainer();

    const dto = await container.commandHandlers.startExerciseAttempt.handle(
      StartExerciseAttemptCommand.fromRequest({ exerciseId, studentId: actor.studentId }),
    );
    return jsonSuccess(dto, 201);
  } catch (error) {
    return jsonError(error);
  }
}

export async function autosaveExerciseDraft(request: Request, attemptId: string): Promise<NextResponse> {
  try {
    const actor = await resolveLaboratoryActor();
    const container = createLaboratoryContainer();
    const body = (await request.json()) as { content?: unknown };

    const dto = await container.commandHandlers.autosaveExerciseDraft.handle(
      AutosaveExerciseDraftCommand.fromRequest({
        attemptId,
        studentId: actor.studentId,
        content: body.content as string,
      }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}

export async function completeExerciseAttempt(request: Request, attemptId: string): Promise<NextResponse> {
  try {
    requireIdempotencyKey(request);
    const actor = await resolveLaboratoryActor();
    const container = createLaboratoryContainer();

    const dto = await container.commandHandlers.completeExerciseAttempt.handle(
      CompleteExerciseAttemptCommand.fromRequest({ attemptId, studentId: actor.studentId }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}
