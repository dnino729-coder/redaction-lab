import type { NextResponse } from "next/server";
import { AttemptId } from "@/features/academy/domain/value-objects/AttemptId";
import { AttemptMapper } from "@/features/academy/application/mappers/AttemptMapper";
import { ResourceNotFoundException } from "@/features/academy/application/exceptions/ResourceNotFoundException";
import { createAcademyContainer } from "../composition/academyContainer";
import { resolveAcademyActor, requireRole } from "../http/auth";
import { requireIdempotencyKey } from "../http/idempotency";
import { jsonSuccess, type AcademyResponseHeaders } from "../http/response";

import { AutosaveDraftCommand } from "@/features/academy/application/commands/AutosaveDraftCommand";
import { SubmitProductionCommand } from "@/features/academy/application/commands/SubmitProductionCommand";
import { SubmitRevisionCommand } from "@/features/academy/application/commands/SubmitRevisionCommand";
import { AdvanceToReflectionCommand } from "@/features/academy/application/commands/AdvanceToReflectionCommand";
import { CompleteReflectionCommand } from "@/features/academy/application/commands/CompleteReflectionCommand";
import { AdvanceStepCommand } from "@/features/academy/application/commands/AdvanceStepCommand";
import { VerifyComprehensionCommand } from "@/features/academy/application/commands/VerifyComprehensionCommand";
import { GetVersionFeedbackQuery } from "@/features/academy/application/queries/GetVersionFeedbackQuery";
import { GetAcademyUnitDetailQuery } from "@/features/academy/application/queries/GetAcademyUnitDetailQuery";

import {
  toAutosaveDraftRequest,
  toSubmitProductionRequest,
  toSubmitRevisionRequest,
  toAdvanceToReflectionRequest,
  toCompleteReflectionRequest,
  toAdvanceStepRequest,
  toVerifyComprehensionRequest,
  toGetVersionFeedbackRequest,
} from "../request-mappers/attemptRequestMappers";
import { toGetUnitDetailRequest } from "../request-mappers/unitRequestMappers";
import {
  toAttemptSummaryHttp,
  toDraftHttp,
  toVersionHttp,
  toVersionFeedbackHttp,
} from "../response-mappers/attemptResponseMappers";
import { toUnitDetailHttp } from "../response-mappers/unitResponseMappers";

// Route Handlers de `academy/attempts` — EP-02, EP-03, EP-04, EP-05,
// EP-17, EP-18, EP-21, EP-22 (API Contract v1.3, Sección 4).

// EP-02 — PUT /api/v1/academy/attempts/{attemptId}/draft (nativa, sin
// Idempotency-Key — Sección 2, "PUT/PATCH... no requieren esta clave").
export async function handleAutosaveDraft(
  request: Request,
  attemptId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const body = (await request.json()) as { content: unknown };
  const container = createAcademyContainer();

  const dto = await container.commandHandlers.autosaveDraft.handle(
    AutosaveDraftCommand.fromRequest(toAutosaveDraftRequest(attemptId, actor.userId, body.content)),
  );
  return jsonSuccess(toDraftHttp(dto), 200, headers);
}

// EP-17 — GET /api/v1/academy/attempts/{attemptId}/draft
//
// Nota (Contrato v1.3, EP-17): no existe una Query dedicada en Application
// para este caso ("proyección de un único campo ya persistido del
// Aggregate, sin necesidad de una Query independiente") — se lee
// directamente vía `AttemptRepository` + `AttemptMapper.toDraftDto`
// (ambos ya Frozen), exactamente como el propio Contrato documenta.
export async function handleGetDraft(
  attemptId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();

  const attempt = await container.ports.unitOfWork.execute(
    () => container.services.authorizationGuard.assertAttemptOwnership(attemptId, actor.userId),
    actor.userId,
  );
  if (!attempt.draft) {
    throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_DRAFT", "Draft", attemptId);
  }
  const dto = AttemptMapper.toDraftDto(attempt.id.value, attempt.draft);
  return jsonSuccess(toDraftHttp(dto), 200, headers);
}

// EP-03 — POST /api/v1/academy/attempts/{attemptId}/versions
//
// Nota de reconciliación (disclosed, no BLOCKER): el Contrato dice "la
// selección [CMD-02 vs CMD-05] la determina el estado del Attempt en
// Application, no el cliente" — pero Application (Frozen) expone dos
// Handlers separados sin un despachador unificado. Esta API Layer resuelve
// la selección leyendo el número de versiones ya persistidas (una lectura,
// no una regla de negocio nueva) antes de invocar el Handler
// correspondiente — fiel al criterio del Contrato sin modificar
// Application.
export async function handleSubmitVersion(
  request: Request,
  attemptId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  requireIdempotencyKey(request);
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const body = (await request.json()) as { content: unknown };
  const container = createAcademyContainer();

  const existing = await container.ports.unitOfWork.execute(
    () => container.repositories.attempt.findById(AttemptId.create(attemptId)),
    actor.userId,
  );
  if (!existing) {
    throw new ResourceNotFoundException("ACADEMY_NOT_FOUND_ATTEMPT", "Attempt", attemptId);
  }
  const hasProduction = existing.versions.length > 0;

  const versionDto = hasProduction
    ? await container.commandHandlers.submitRevision.handle(
        SubmitRevisionCommand.fromRequest(toSubmitRevisionRequest(attemptId, actor.userId, body.content)),
      )
    : await container.commandHandlers.submitProduction.handle(
        SubmitProductionCommand.fromRequest(
          toSubmitProductionRequest(attemptId, actor.userId, body.content),
        ),
      );

  const versionHttp = toVersionHttp(versionDto);
  if (versionHttp.feedbackStatus === "READY") {
    // Sprint 6.3.2: call site actualizado por cambio de firma de
    // `toGetVersionFeedbackRequest` (remediacion H-01) -- `actor.userId`
    // ya estaba disponible en este scope.
    const feedbackResult = await container.queryHandlers.getVersionFeedback.handle(
      GetVersionFeedbackQuery.fromRequest(
        toGetVersionFeedbackRequest(attemptId, versionDto.versionNumber, actor.userId),
      ),
    );
    return jsonSuccess({ ...versionHttp, feedback: toVersionFeedbackHttp(feedbackResult) }, 201, headers);
  }
  return jsonSuccess(versionHttp, 202, headers);
}

// EP-04 — PATCH /api/v1/academy/attempts/{attemptId}/phase (nativa, sin
// Idempotency-Key).
export async function handleAdvancePhase(
  request: Request,
  attemptId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();

  const dto = await container.commandHandlers.advanceToReflection.handle(
    AdvanceToReflectionCommand.fromRequest(toAdvanceToReflectionRequest(attemptId, actor.userId)),
  );
  return jsonSuccess(toAttemptSummaryHttp(dto), 200, headers);
}

// EP-05 — POST /api/v1/academy/attempts/{attemptId}/reflection
//
// Nota de reconciliación (disclosed, no BLOCKER): el Contrato documenta la
// respuesta como `AcademyUnitDetailDTO` ("reflejando el nuevo estado");
// `CompleteReflectionHandler` (Application, Frozen) retorna
// `AttemptSummaryResponseDto`, no el detalle de la Unidad — la transición
// `AcademyUnit` real ocurre en una segunda transacción, eventual,
// disparada por `CompleteUnitOnReflectionCompletedHandler` reaccionando a
// `ReflectionCompleted` (patrón "dos transacciones", Application Layer
// Spec v1.0 §3). Esta API Layer compone la forma exigida por el Contrato
// invocando QRY-02 `GetAcademyUnitDetail` inmediatamente después — el
// contenido devuelto será consistente en cuanto el publicador de Outbox
// (fuera de alcance desde Sprint 6.2) procese el evento; hasta entonces,
// el campo `state` puede no reflejar aún `COMPLETED`/`MASTERED` de forma
// síncrona. Disclosed en el informe de entrega — no se fabrica el
// resultado, se compone con el Query real ya existente.
export async function handleCompleteReflection(
  request: Request,
  attemptId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  requireIdempotencyKey(request);
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const body = (await request.json()) as { responses: unknown };
  const container = createAcademyContainer();

  const attemptDto = await container.commandHandlers.completeReflection.handle(
    CompleteReflectionCommand.fromRequest(
      toCompleteReflectionRequest(attemptId, actor.userId, body.responses),
    ),
  );
  // Sprint 6.3.2: call site actualizado por cambio de firma de
  // `toGetUnitDetailRequest` (remediacion H-01) -- no enumerado en el
  // inventario original del Blueprint Sprint 6.3.1, detectado por la
  // compilacion estricta (Paso 9); `actor.userId` ya estaba disponible en
  // este scope (EP-05, handleCompleteReflection).
  const unitDto = await container.queryHandlers.getAcademyUnitDetail.handle(
    GetAcademyUnitDetailQuery.fromRequest(toGetUnitDetailRequest(attemptDto.unitId, actor.userId)),
  );
  return jsonSuccess(toUnitDetailHttp(unitDto), 201, headers);
}

// EP-18 — GET /api/v1/academy/attempts/{attemptId}/feedback
//
// Sprint 6.3.2 (remediacion H-01, BOLA/OWASP API1:2023 — ver ACA-003/
// ACA-004/ACP-002): anadido `requireRole` (faltaba) y propagacion de
// `actor.userId` como ownership hacia el Query Handler/Read Model.
export async function handleGetFeedback(
  request: Request,
  attemptId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();
  const url = new URL(request.url);
  const versionNumber = Number(url.searchParams.get("versionNumber") ?? "1");

  const dto = await container.queryHandlers.getVersionFeedback.handle(
    GetVersionFeedbackQuery.fromRequest(
      toGetVersionFeedbackRequest(attemptId, versionNumber, actor.userId),
    ),
  );
  return jsonSuccess(toVersionFeedbackHttp(dto), 200, headers);
}

// EP-21 — PATCH /api/v1/academy/attempts/{attemptId}/step (excepción
// explícita del Contrato: SÍ requiere Idempotency-Key pese a ser PATCH).
export async function handleAdvanceStep(
  request: Request,
  attemptId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  requireIdempotencyKey(request);
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();

  const dto = await container.commandHandlers.advanceStep.handle(
    AdvanceStepCommand.fromRequest(toAdvanceStepRequest(attemptId, actor.userId)),
  );
  return jsonSuccess(toAttemptSummaryHttp(dto), 200, headers);
}

// EP-22 — POST /api/v1/academy/attempts/{attemptId}/comprehension
export async function handleVerifyComprehension(
  request: Request,
  attemptId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  requireIdempotencyKey(request);
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const body = (await request.json()) as { comprehensionResponse: unknown };
  const container = createAcademyContainer();

  const dto = await container.commandHandlers.verifyComprehension.handle(
    VerifyComprehensionCommand.fromRequest(
      toVerifyComprehensionRequest(attemptId, actor.userId, body.comprehensionResponse),
    ),
  );
  // `VerifyComprehensionHandler` (Application) nunca lanza excepción ante
  // una verificación insuficiente — permanece en `COMPREHEND` (caso
  // válido, ver Handler). El Contrato distingue este caso por código HTTP
  // (`422`), no por excepción: se decide aquí comparando el
  // `currentStep` devuelto.
  const status = dto.currentStep === "COMPREHEND" ? 422 : 200;
  return jsonSuccess(toAttemptSummaryHttp(dto), status, headers);
}

