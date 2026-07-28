import { NextResponse } from "next/server";
import { createAcademyContainer } from "../composition/academyContainer";
import { resolveAcademyActor, requireRole } from "../http/auth";
import { jsonSuccess, jsonNoContent, type AcademyResponseHeaders } from "../http/response";
import { GetContinuationStateQuery } from "@/features/academy/application/queries/GetContinuationStateQuery";
import { toGetContinuationStateRequest } from "../request-mappers/attemptRequestMappers";
import { toContinuationStateHttp } from "../response-mappers/attemptResponseMappers";
import { toStudentProgressSummaryHttp } from "../response-mappers/teacherResponseMappers";

// Route Handlers de progreso propio del estudiante — EP-12, EP-15 (API
// Contract v1.3, Sección 4).

// EP-12 — GET /api/v1/academy/progress-summary
//
// Nota de reconciliación (disclosed, no BLOCKER): `QRY-07
// GetStudentProgressSummaryHandler` (Application, Frozen) exige
// incondicionalmente `authorizationGuard.assertTeacherRelationship(...)` —
// correcto para EP-20 (vista de Profesor), pero incompatible con EP-12 (el
// propio estudiante consultando su resumen, sin ningún Profesor
// involucrado: no hay `teacherId` que verificar). Para EP-12 esta API
// Layer invoca directamente `AcademyReadModelPort.getStudentProgressSummary`
// (el mismo Read Model que el Handler usa internamente, único origen de
// lectura de CQRS) en vez de forzar una relación docente que no aplica a
// una auto-consulta — el `studentId` consultado es siempre el del actor
// autenticado, nunca un valor arbitrario del cliente.
export async function handleGetMyProgressSummary(headers: AcademyResponseHeaders): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();

  const dto = await container.ports.readModel.getStudentProgressSummary(actor.userId);
  return jsonSuccess(toStudentProgressSummaryHttp(dto), 200, headers);
}

// EP-15 — GET /api/v1/academy/continuation ("Continúa donde te
// quedaste") — `204 No Content` si no hay ningún Attempt activo (caso
// válido documentado por el Contrato, no un error).
export async function handleGetContinuation(headers: AcademyResponseHeaders): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT"]);
  const container = createAcademyContainer();

  const dto = await container.queryHandlers.getContinuationState.handle(
    GetContinuationStateQuery.fromRequest(toGetContinuationStateRequest(actor.userId)),
  );
  if (!dto) return jsonNoContent(headers);
  return jsonSuccess(toContinuationStateHttp(dto), 200, headers);
}
