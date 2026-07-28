import { NextResponse } from "next/server";
import { createAcademyContainer } from "../composition/academyContainer";
import { resolveAcademyActor, requireRole } from "../http/auth";
import { requireIdempotencyKey } from "../http/idempotency";
import { jsonSuccess, type AcademyResponseHeaders } from "../http/response";
import { AssignUnitToStudentCommand } from "@/features/academy/application/commands/AssignUnitToStudentCommand";
import { GetStudentProgressSummaryQuery } from "@/features/academy/application/queries/GetStudentProgressSummaryQuery";
import { GetStudentUnitHistoryQuery } from "@/features/academy/application/queries/GetStudentUnitHistoryQuery";
import {
  toAssignUnitToStudentRequest,
  toGetStudentProgressSummaryRequest,
  toGetStudentUnitHistoryRequest,
} from "../request-mappers/teacherRequestMappers";
import {
  toTeacherRecommendationHttp,
  toStudentProgressSummaryHttp,
  toStudentUnitHistoryHttp,
} from "../response-mappers/teacherResponseMappers";

// Route Handlers de vista Profesor — EP-08, EP-20, EP-23 (API Contract
// v1.3, Sección 4). Los tres exigen `TEACHER` + relación docente-estudiante
// verificada (`AcademyAuthorizationGuard.assertTeacherRelationship`, ya
// invocado dentro de cada Handler de Application) — ver
// `features/academy/api/composition/adapters/TeacherStudentRelationshipAdapter.ts`
// para el hallazgo disclosed sobre el estado real de esa verificación.

// EP-08 — POST /api/v1/academy/students/{studentId}/unit-recommendations
export async function handleAssignUnitToStudent(
  request: Request,
  studentId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  requireIdempotencyKey(request);
  const actor = await resolveAcademyActor();
  requireRole(actor, ["TEACHER"]);
  const body = (await request.json()) as { unitId: unknown };
  const container = createAcademyContainer();

  const dto = await container.commandHandlers.assignUnitToStudent.handle(
    AssignUnitToStudentCommand.fromRequest(
      toAssignUnitToStudentRequest(studentId, body.unitId, actor.userId),
    ),
  );
  return jsonSuccess(toTeacherRecommendationHttp(dto), 201, headers);
}

// EP-20 — GET /api/v1/academy/students/{studentId}/progress-summary
export async function handleGetStudentProgressSummary(
  studentId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["TEACHER"]);
  const container = createAcademyContainer();

  const dto = await container.queryHandlers.getStudentProgressSummary.handle(
    GetStudentProgressSummaryQuery.fromRequest(
      toGetStudentProgressSummaryRequest(studentId, actor.userId),
    ),
  );
  return jsonSuccess(toStudentProgressSummaryHttp(dto), 200, headers);
}

// EP-23 — GET /api/v1/academy/students/{studentId}/units/{unitId}/history
export async function handleGetStudentUnitHistory(
  studentId: string,
  unitId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["TEACHER"]);
  const container = createAcademyContainer();

  const dto = await container.queryHandlers.getStudentUnitHistory.handle(
    GetStudentUnitHistoryQuery.fromRequest(
      toGetStudentUnitHistoryRequest(actor.userId, studentId, unitId),
    ),
  );
  return jsonSuccess(toStudentUnitHistoryHttp(dto), 200, headers);
}
