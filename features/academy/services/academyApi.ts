// Blueprint §3/§3.1/§8.2 — las 17 operaciones REST de Academia (las 6
// restantes de los 23 endpoints de negocio ya tienen Server Action, ver
// features/academy/actions/, consumidas directamente por los hooks
// correspondientes, nunca desde aquí). Cada función corresponde 1:1 a un
// endpoint del API Contract v1.3 — transporte + mapeo de error únicamente,
// cero lógica de negocio.
import { apiFetch } from "@/lib/apiClient";
import type {
  AcademyUnitDetailHttp,
  AcademyUnitSummaryHttp,
  AttemptSummaryHttp,
  ContinuationStateHttp,
  DraftHttp,
  FeedbackHttp,
  ModelExampleHttp,
  StudentProgressSummaryHttp,
  StudentUnitHistoryHttp,
  TeacherOverrideHttp,
  TeacherRecommendationHttp,
  TextType,
} from "../types";

interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}
interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

const BASE = "/api/v1/academy";

// EP-13
export async function getUnits(textType?: TextType): Promise<PaginatedResponse<AcademyUnitSummaryHttp>> {
  const query = textType ? `?textType=${encodeURIComponent(textType)}` : "";
  return apiFetch<PaginatedResponse<AcademyUnitSummaryHttp>>(`${BASE}/units${query}`);
}

// EP-14
export async function getUnitDetail(unitId: string): Promise<AcademyUnitDetailHttp> {
  return apiFetch<AcademyUnitDetailHttp>(`${BASE}/units/${unitId}`);
}

// EP-16
export async function getUnitAttempts(unitId: string): Promise<PaginatedResponse<AttemptSummaryHttp>> {
  return apiFetch<PaginatedResponse<AttemptSummaryHttp>>(`${BASE}/units/${unitId}/attempts`);
}

// EP-07 — Idempotency-Key obligatorio (API Contract v1.3 §4).
export async function applyTeacherOverride(
  unitId: string,
  input: { action: "FORCE_LOCK" | "FORCE_RESTART"; reason: string },
  idempotencyKey: string,
): Promise<TeacherOverrideHttp> {
  return apiFetch<TeacherOverrideHttp>(`${BASE}/units/${unitId}/teacher-overrides`, {
    method: "POST",
    body: input,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

// EP-08 — Idempotency-Key obligatorio.
export async function assignUnitToStudent(
  studentId: string,
  unitId: string,
  idempotencyKey: string,
): Promise<TeacherRecommendationHttp> {
  return apiFetch<TeacherRecommendationHttp>(`${BASE}/students/${studentId}/unit-recommendations`, {
    method: "POST",
    body: { unitId },
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

// EP-09 — Idempotency-Key obligatorio.
export async function createModelExample(
  input: {
    textType: TextType;
    content: string;
    rating: "EXCELLENT" | "HAS_ERRORS";
    curatorialComment: string;
  },
  idempotencyKey: string,
): Promise<ModelExampleHttp> {
  return apiFetch<ModelExampleHttp>(`${BASE}/model-examples`, {
    method: "POST",
    body: input,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

// EP-19
export async function getModelExamples(textType?: TextType): Promise<PaginatedResponse<ModelExampleHttp>> {
  const query = textType ? `?textType=${encodeURIComponent(textType)}` : "";
  return apiFetch<PaginatedResponse<ModelExampleHttp>>(`${BASE}/model-examples${query}`);
}

// EP-10
export async function updateModelExample(
  modelExampleId: string,
  patch: { content?: string; curatorialComment?: string },
): Promise<ModelExampleHttp> {
  return apiFetch<ModelExampleHttp>(`${BASE}/model-examples/${modelExampleId}`, {
    method: "PATCH",
    body: patch,
  });
}

// EP-11
export async function retireModelExample(modelExampleId: string): Promise<ModelExampleHttp> {
  return apiFetch<ModelExampleHttp>(`${BASE}/model-examples/${modelExampleId}`, {
    method: "DELETE",
  });
}

// EP-12
export async function getMyProgressSummary(): Promise<StudentProgressSummaryHttp> {
  return apiFetch<StudentProgressSummaryHttp>(`${BASE}/progress-summary`);
}

// EP-20
export async function getStudentProgressSummary(studentId: string): Promise<StudentProgressSummaryHttp> {
  return apiFetch<StudentProgressSummaryHttp>(`${BASE}/students/${studentId}/progress-summary`);
}

// EP-15 — 204 → null (manejado por `apiFetch`).
export async function getContinuation(): Promise<ContinuationStateHttp> {
  return apiFetch<ContinuationStateHttp>(`${BASE}/continuation`);
}

// EP-17 — 404 (sin borrador) se propaga como `ApiError`; el hook lo trata
// como Empty, no como Error (Blueprint §12, P-08).
export async function getDraft(attemptId: string): Promise<DraftHttp> {
  return apiFetch<DraftHttp>(`${BASE}/attempts/${attemptId}/draft`);
}

// EP-04 — sin Server Action (Blueprint §3.1). Sin Idempotency-Key (no
// listado como obligatorio en el API Contract v1.3 para este endpoint).
export async function advancePhase(attemptId: string): Promise<AttemptSummaryHttp> {
  return apiFetch<AttemptSummaryHttp>(`${BASE}/attempts/${attemptId}/phase`, {
    method: "PATCH",
    body: { targetPhase: "REFLECTION" },
  });
}

// EP-05 — Idempotency-Key obligatorio.
export async function completeReflection(
  attemptId: string,
  responses: readonly string[],
  idempotencyKey: string,
): Promise<AcademyUnitDetailHttp> {
  return apiFetch<AcademyUnitDetailHttp>(`${BASE}/attempts/${attemptId}/reflection`, {
    method: "POST",
    body: { responses },
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

// EP-18
export async function getFeedback(attemptId: string, versionNumber: number): Promise<FeedbackHttp> {
  return apiFetch<FeedbackHttp>(`${BASE}/attempts/${attemptId}/feedback?versionNumber=${versionNumber}`);
}

// EP-23
export async function getStudentUnitHistory(
  studentId: string,
  unitId: string,
): Promise<StudentUnitHistoryHttp> {
  return apiFetch<StudentUnitHistoryHttp>(`${BASE}/students/${studentId}/units/${unitId}/history`);
}
