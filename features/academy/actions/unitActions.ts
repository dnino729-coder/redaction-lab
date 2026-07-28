"use server";
import { createAcademyContainer } from "@/features/academy/api/composition/academyContainer";
import { resolveAcademyActor, requireRole } from "@/features/academy/api/http/auth";
import { toStartUnitRequest, toRepeatUnitRequest } from "@/features/academy/api/request-mappers/unitRequestMappers";
import { toAttemptSummaryHttp, type AttemptSummaryHttp } from "@/features/academy/api/response-mappers/attemptResponseMappers";
import { StartUnitCommand } from "@/features/academy/application/commands/StartUnitCommand";
import { RepeatUnitCommand } from "@/features/academy/application/commands/RepeatUnitCommand";
import { ConflictException } from "@/features/academy/application/exceptions/ConflictException";
import { GetAttemptHistoryQuery } from "@/features/academy/application/queries/GetAttemptHistoryQuery";
import { toGetAttemptHistoryRequest } from "@/features/academy/api/request-mappers/unitRequestMappers";

// Server Actions de `AcademyUnit` — mismo criterio de alcance deliberado
// que `attemptActions.ts` (ver cabecera de ese archivo).

export async function startUnitAction(unitId: string): Promise<AttemptSummaryHttp> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();

  try {
    const dto = await container.commandHandlers.startUnit.handle(
      StartUnitCommand.fromRequest(toStartUnitRequest(unitId, actor.userId)),
    );
    return toAttemptSummaryHttp(dto);
  } catch (error) {
    // Mismo comportamiento idempotente que EP-01 (ver
    // `features/academy/api/handlers/unitsHandlers.ts`, nota de
    // reconciliación) — reutilizado aquí, no reimplementado.
    if (error instanceof ConflictException && error.code === "ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE") {
      // Sprint 6.3.2: call site actualizado por cambio de firma de
      // `toGetAttemptHistoryRequest` (remediacion H-01) -- `actor.userId`
      // ya estaba disponible en este scope.
      const attempts = await container.queryHandlers.getAttemptHistory.handle(
        GetAttemptHistoryQuery.fromRequest(toGetAttemptHistoryRequest(unitId, actor.userId)),
      );
      const active = attempts.find((attempt) => attempt.isCurrent);
      if (active) return toAttemptSummaryHttp(active);
    }
    throw error;
  }
}

export async function repeatUnitAction(unitId: string): Promise<AttemptSummaryHttp> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();
  const dto = await container.commandHandlers.repeatUnit.handle(
    RepeatUnitCommand.fromRequest(toRepeatUnitRequest(unitId, actor.userId)),
  );
  return toAttemptSummaryHttp(dto);
}
