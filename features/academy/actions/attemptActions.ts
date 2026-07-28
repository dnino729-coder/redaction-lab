"use server";
// Server Actions de Academia (Sprint 6.3, Alcance #2 — "flujos internos
// del frontend"). Mismo patrón que `features/dashboard/actions/dashboard.actions.ts`:
// una función `"use server"` delgada por acción, delegando íntegramente en
// el Application Layer a través del mismo Composition Root/Command
// Handlers que usan los Route Handlers REST — CERO lógica propia, cero
// duplicación (reutiliza literalmente los mismos Request/Response Mappers
// de `features/academy/api/`).
//
// Alcance deliberado: no se crea una Server Action por cada uno de los 23
// endpoints (la superficie pública completa ya la cubre el Contrato REST,
// consumible desde cualquier cliente) — solo los flujos de escritura de
// más alta frecuencia de interacción del Estudiante dentro de una misma
// pantalla (autoguardado de borrador, avance de paso, verificación de
// comprensión, envío de producción/reescritura), donde una Server Action
// evita un salto HTTP adicional desde un Server Component/Client Component
// ya dentro del propio Next.js — consistente con cómo Mi Plan/Dashboard ya
// usan Server Actions únicamente para "mutaciones ligeras de interacción",
// nunca para reemplazar el contrato REST completo.

import { createAcademyContainer } from "@/features/academy/api/composition/academyContainer";
import { resolveAcademyActor, requireRole } from "@/features/academy/api/http/auth";
import {
  toAutosaveDraftRequest,
  toAdvanceStepRequest,
  toVerifyComprehensionRequest,
  toSubmitProductionRequest,
  toSubmitRevisionRequest,
} from "@/features/academy/api/request-mappers/attemptRequestMappers";
import {
  toDraftHttp,
  toAttemptSummaryHttp,
  toVersionHttp,
  type VersionHttp,
  type AttemptSummaryHttp,
} from "@/features/academy/api/response-mappers/attemptResponseMappers";
import { AutosaveDraftCommand } from "@/features/academy/application/commands/AutosaveDraftCommand";
import { AdvanceStepCommand } from "@/features/academy/application/commands/AdvanceStepCommand";
import { VerifyComprehensionCommand } from "@/features/academy/application/commands/VerifyComprehensionCommand";
import { SubmitProductionCommand } from "@/features/academy/application/commands/SubmitProductionCommand";
import { SubmitRevisionCommand } from "@/features/academy/application/commands/SubmitRevisionCommand";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { ResourceNotFoundException } from "@/features/academy/application/exceptions/ResourceNotFoundException";
import type { DraftResponseDto } from "@/features/academy/application/dto/DraftDto";

export async function autosaveDraftAction(
  attemptId: string,
  content: string,
): Promise<DraftResponseDto> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();
  const dto = await container.commandHandlers.autosaveDraft.handle(
    AutosaveDraftCommand.fromRequest(toAutosaveDraftRequest(attemptId, actor.userId, content)),
  );
  return toDraftHttp(dto);
}

export async function advanceStepAction(attemptId: string): Promise<AttemptSummaryHttp> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();
  const dto = await container.commandHandlers.advanceStep.handle(
    AdvanceStepCommand.fromRequest(toAdvanceStepRequest(attemptId, actor.userId)),
  );
  return toAttemptSummaryHttp(dto);
}

export interface VerifyComprehensionActionResult {
  readonly attempt: AttemptSummaryHttp;
  readonly satisfied: boolean;
}

export async function verifyComprehensionAction(
  attemptId: string,
  comprehensionResponse: string,
): Promise<VerifyComprehensionActionResult> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();
  const dto = await container.commandHandlers.verifyComprehension.handle(
    VerifyComprehensionCommand.fromRequest(
      toVerifyComprehensionRequest(attemptId, actor.userId, comprehensionResponse),
    ),
  );
  return { attempt: toAttemptSummaryHttp(dto), satisfied: dto.currentStep !== "COMPREHEND" };
}

export async function submitVersionAction(attemptId: string, content: string): Promise<VersionHttp> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();

  const existing = await container.ports.unitOfWork.execute(
    () => container.repositories.attempt.findById(AttemptId.create(attemptId)),
    actor.userId,
  );
  if (!existing) {
    throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_ATTEMPT", "Attempt", attemptId);
  }
  const hasProduction = existing.versions.length > 0;

  const dto = hasProduction
    ? await container.commandHandlers.submitRevision.handle(
        SubmitRevisionCommand.fromRequest(toSubmitRevisionRequest(attemptId, actor.userId, content)),
      )
    : await container.commandHandlers.submitProduction.handle(
        SubmitProductionCommand.fromRequest(toSubmitProductionRequest(attemptId, actor.userId, content)),
      );
  return toVersionHttp(dto);
}
