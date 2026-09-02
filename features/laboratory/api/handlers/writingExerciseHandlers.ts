import type { NextResponse } from "next/server";
import { createLaboratoryContainer } from "../composition/laboratoryContainer";
import { resolveLaboratoryActor } from "../http/auth";
import { requireIdempotencyKey } from "../http/idempotency";
import { jsonSuccess, jsonError, resolvePagination, paginate } from "../http/response";

import { CreateWritingExerciseCommand } from "@/features/laboratory/application/commands/CreateWritingExerciseCommand";
import { ListWritingExercisesForStudentQuery } from "@/features/laboratory/application/queries/ListWritingExercisesForStudentQuery";
import { GetWritingExerciseDetailQuery } from "@/features/laboratory/application/queries/GetWritingExerciseDetailQuery";
import { GetExerciseAttemptHistoryQuery } from "@/features/laboratory/application/queries/GetExerciseAttemptHistoryQuery";

export async function createWritingExercise(request: Request): Promise<NextResponse> {
  try {
    requireIdempotencyKey(request);
    const actor = await resolveLaboratoryActor();
    const container = createLaboratoryContainer();
    const body = (await request.json()) as { mode?: unknown; textType?: unknown; guidedPrompt?: unknown };

    const dto = await container.commandHandlers.createWritingExercise.handle(
      CreateWritingExerciseCommand.fromRequest({
        studentId: actor.studentId,
        mode: body.mode as string,
        textType: body.textType as string,
        guidedPrompt: (body.guidedPrompt as string | null | undefined) ?? null,
      }),
    );
    return jsonSuccess(dto, 201);
  } catch (error) {
    return jsonError(error);
  }
}

export async function listWritingExercises(request: Request): Promise<NextResponse> {
  try {
    const actor = await resolveLaboratoryActor();
    const container = createLaboratoryContainer();
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") ?? undefined;
    const pagination = resolvePagination(url.searchParams);

    const items = await container.queryHandlers.listWritingExercisesForStudent.handle(
      ListWritingExercisesForStudentQuery.fromRequest({ studentId: actor.studentId, mode }),
    );
    return jsonSuccess(paginate(items, pagination), 200);
  } catch (error) {
    return jsonError(error);
  }
}

export async function getWritingExercise(exerciseId: string): Promise<NextResponse> {
  try {
    const actor = await resolveLaboratoryActor();
    const container = createLaboratoryContainer();

    const dto = await container.queryHandlers.getWritingExerciseDetail.handle(
      GetWritingExerciseDetailQuery.fromRequest({ exerciseId, studentId: actor.studentId }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}

export async function getExerciseHistory(exerciseId: string): Promise<NextResponse> {
  try {
    const actor = await resolveLaboratoryActor();
    const container = createLaboratoryContainer();

    const dto = await container.queryHandlers.getExerciseAttemptHistory.handle(
      GetExerciseAttemptHistoryQuery.fromRequest({ exerciseId, studentId: actor.studentId }),
    );
    return jsonSuccess(dto, 200);
  } catch (error) {
    return jsonError(error);
  }
}
