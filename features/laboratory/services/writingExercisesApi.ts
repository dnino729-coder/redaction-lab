// Transporte REST para el bloque "Atelier d'écriture" (bloque 3) — mismo
// patrón que modelExamplesApi.ts: apiFetch genérico compartido, formas
// HTTP propias del frontend (no importadas de application/, mismo
// criterio de aislamiento que el resto del módulo).
import { apiFetch } from "@/lib/apiClient";

export type ExerciseMode = "GUIDED" | "AUTONOMOUS";
export type ExerciseStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type ExerciseTextType = "LETTER" | "ARTICLE" | "ESSAY" | "EMAIL" | "REPORT";

export interface WritingExerciseHttp {
  id: string;
  mode: ExerciseMode;
  textType: ExerciseTextType;
  guidedPrompt: string | null;
  status: ExerciseStatus;
  createdAt: string;
}

export interface ExerciseAttemptHttp {
  id: string;
  attemptNumber: number;
  status: ExerciseStatus;
  wordCount: number;
  startedAt: string;
  completedAt: string | null;
}

export interface ExerciseAttemptDetailHttp extends ExerciseAttemptHttp {
  content: string;
}

export interface ExerciseHistoryHttp {
  exercise: WritingExerciseHttp;
  attempts: ExerciseAttemptHttp[];
}

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; limit: number; offset: number };
}

const BASE = "/api/v1/laboratory";

function idempotencyKey(): string {
  return crypto.randomUUID();
}

export async function getWritingExercises(mode?: ExerciseMode): Promise<PaginatedResponse<WritingExerciseHttp>> {
  const query = mode ? `?mode=${encodeURIComponent(mode)}` : "";
  return apiFetch<PaginatedResponse<WritingExerciseHttp>>(`${BASE}/exercises${query}`);
}

export async function getWritingExercise(exerciseId: string): Promise<WritingExerciseHttp> {
  return apiFetch<WritingExerciseHttp>(`${BASE}/exercises/${exerciseId}`);
}

export async function getExerciseHistory(exerciseId: string): Promise<ExerciseHistoryHttp> {
  return apiFetch<ExerciseHistoryHttp>(`${BASE}/exercises/${exerciseId}/history`);
}

export interface CreateWritingExerciseInput {
  mode: ExerciseMode;
  textType: ExerciseTextType;
  guidedPrompt?: string | null;
}

export async function createWritingExercise(input: CreateWritingExerciseInput): Promise<WritingExerciseHttp> {
  return apiFetch<WritingExerciseHttp>(`${BASE}/exercises`, {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey() },
    body: input,
  });
}

export async function startExerciseAttempt(exerciseId: string): Promise<ExerciseAttemptDetailHttp> {
  return apiFetch<ExerciseAttemptDetailHttp>(`${BASE}/exercises/${exerciseId}/attempts`, {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey() },
  });
}

export async function autosaveExerciseDraft(attemptId: string, content: string): Promise<ExerciseAttemptDetailHttp> {
  return apiFetch<ExerciseAttemptDetailHttp>(`${BASE}/attempts/${attemptId}/draft`, {
    method: "PATCH",
    body: { content },
  });
}

export async function completeExerciseAttempt(attemptId: string): Promise<ExerciseAttemptDetailHttp> {
  return apiFetch<ExerciseAttemptDetailHttp>(`${BASE}/attempts/${attemptId}/complete`, {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey() },
  });
}
