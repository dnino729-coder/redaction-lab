import { NextResponse } from "next/server";
import { createAcademyContainer } from "../composition/academyContainer";
import { resolveAcademyActor, requireRole } from "../http/auth";
import { requireIdempotencyKey } from "../http/idempotency";
import { jsonSuccess, resolvePagination, paginate, type AcademyResponseHeaders } from "../http/response";
import { ConflictException } from "@/features/academy/application/exceptions/ConflictException";
import { StartUnitCommand } from "@/features/academy/application/commands/StartUnitCommand";
import { RepeatUnitCommand } from "@/features/academy/application/commands/RepeatUnitCommand";
import { ApplyTeacherOverrideCommand } from "@/features/academy/application/commands/ApplyTeacherOverrideCommand";
import { ListAcademyUnitsForStudentQuery } from "@/features/academy/application/queries/ListAcademyUnitsForStudentQuery";
import { GetAcademyUnitDetailQuery } from "@/features/academy/application/queries/GetAcademyUnitDetailQuery";
import { GetAttemptHistoryQuery } from "@/features/academy/application/queries/GetAttemptHistoryQuery";
import {
  toStartUnitRequest,
  toRepeatUnitRequest,
  toApplyTeacherOverrideRequest,
  toListUnitsForStudentRequest,
  toGetUnitDetailRequest,
  toGetAttemptHistoryRequest,
} from "../request-mappers/unitRequestMappers";
import { toAttemptSummaryHttp } from "../response-mappers/attemptResponseMappers";
import { toUnitDetailHttp } from "../response-mappers/unitResponseMappers";
import { toTeacherOverrideHttp } from "../response-mappers/teacherResponseMappers";

// Route Handlers de `academy/units` — EP-01, EP-06, EP-07, EP-13, EP-14,
// EP-16 (API Contract v1.3, Sección 4). Cada función asume que ya se
// resolvió Correlation Id/Request Id (`http/withHandler.ts`) y que
// cualquier `ApplicationException` lanzada aquí será traducida a HTTP por
// ese mismo wrapper — estas funciones solo orquestan: Auth → Request
// Mapper → Application Handler → Response Mapper.

// EP-01 — POST /api/v1/academy/units/{unitId}/attempts
export async function handleStartUnit(
  request: Request,
  unitId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  requireIdempotencyKey(request);
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();

  try {
    const dto = await container.commandHandlers.startUnit.handle(
      StartUnitCommand.fromRequest(toStartUnitRequest(unitId, actor.userId)),
    );
    return jsonSuccess(toAttemptSummaryHttp(dto), 201, headers);
  } catch (error) {
    // Nota de reconciliación (disclosed, no BLOCKER): el Contrato v1.3
    // (EP-01) exige comportamiento idempotente — "200 OK (ya existía un
    // intento activo — se retorna el existente, sin duplicar)" — pero
    // `StartUnitHandler` (Application, Frozen) lanza
    // `ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE` en ese caso, sin devolver el
    // intento existente. Esta API Layer completa el comportamiento exigido
    // por el Contrato leyendo el intento activo ya existente (una consulta
    // adicional de solo lectura, no una decisión de negocio nueva) en vez
    // de propagar el conflicto como 409 — fiel al texto explícito del
    // Contrato, sin modificar la decisión de Application.
    if (error instanceof ConflictException && error.code === "ACADEMY_RULE_ATTEMPT_ALREADY_ACTIVE") {
      // Sprint 6.3.2: call site actualizado por cambio de firma de
      // `toGetAttemptHistoryRequest` (remediacion H-01) -- `actor.userId`
      // ya estaba disponible en este scope.
      const attempts = await container.queryHandlers.getAttemptHistory.handle(
        GetAttemptHistoryQuery.fromRequest(toGetAttemptHistoryRequest(unitId, actor.userId)),
      );
      const active = attempts.find((attempt) => attempt.isCurrent);
      if (active) {
        return jsonSuccess(toAttemptSummaryHttp(active), 200, headers);
      }
    }
    throw error;
  }
}

// EP-06 — POST /api/v1/academy/units/{unitId}/repetitions
export async function handleRepeatUnit(
  request: Request,
  unitId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  requireIdempotencyKey(request);
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();

  const dto = await container.commandHandlers.repeatUnit.handle(
    RepeatUnitCommand.fromRequest(toRepeatUnitRequest(unitId, actor.userId)),
  );
  return jsonSuccess(toAttemptSummaryHttp(dto), 201, headers);
}

// EP-07 — POST /api/v1/academy/units/{unitId}/teacher-overrides
export async function handleApplyTeacherOverride(
  request: Request,
  unitId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  requireIdempotencyKey(request);
  const actor = await resolveAcademyActor();
  requireRole(actor, ["TEACHER"]);
  const body = (await request.json()) as { action: unknown; reason: unknown };
  const container = createAcademyContainer();

  const dto = await container.commandHandlers.applyTeacherOverride.handle(
    ApplyTeacherOverrideCommand.fromRequest(toApplyTeacherOverrideRequest(unitId, body, actor.userId)),
  );
  return jsonSuccess(toTeacherOverrideHttp(dto), 201, headers);
}

// EP-13 — GET /api/v1/academy/units
export async function handleListUnits(
  request: Request,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();
  const url = new URL(request.url);
  const textType = url.searchParams.get("textType");
  const pagination = resolvePagination(url.searchParams);

  const items = await container.queryHandlers.listAcademyUnitsForStudent.handle(
    ListAcademyUnitsForStudentQuery.fromRequest(toListUnitsForStudentRequest(actor.userId, textType)),
  );
  const page = paginate(items.map(toUnitDetailHttp), pagination);
  return jsonSuccess(page, 200, headers);
}

// EP-14 — GET /api/v1/academy/units/{unitId}
//
// Sprint 6.3.2 (remediacion H-01, BOLA/OWASP API1:2023 — ver ACA-003/
// ACA-004/ACP-002): anadido `requireRole` (faltaba) y propagacion de
// `actor.userId` como ownership hacia el Query Handler/Read Model. Un
// `unitId` de otro estudiante ahora resuelve en 404 (ResourceNotFound),
// nunca en 200 con datos ajenos.
export async function handleGetUnitDetail(
  unitId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();

  const dto = await container.queryHandlers.getAcademyUnitDetail.handle(
    GetAcademyUnitDetailQuery.fromRequest(toGetUnitDetailRequest(unitId, actor.userId)),
  );
  return jsonSuccess(toUnitDetailHttp(dto), 200, headers);
}

// EP-16 — GET /api/v1/academy/units/{unitId}/attempts
//
// Sprint 6.3.2 (remediacion H-01): anadido `requireRole` (faltaba) y
// propagacion de `actor.userId` como ownership.
export async function handleListUnitAttempts(
  request: Request,
  unitId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();
  const url = new URL(request.url);
  const pagination = resolvePagination(url.searchParams);

  const items = await container.queryHandlers.getAttemptHistory.handle(
    GetAttemptHistoryQuery.fromRequest(toGetAttemptHistoryRequest(unitId, actor.userId)),
  );
  const page = paginate(items.map(toAttemptSummaryHttp), pagination);
  return jsonSuccess(page, 200, headers);
}
