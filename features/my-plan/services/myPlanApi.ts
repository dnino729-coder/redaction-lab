// Transporte REST para el bloque "Resumen general" (bloque 1) — mismo
// patrón que features/laboratory/services/writingExercisesApi.ts: apiFetch
// genérico compartido, formas HTTP propias del frontend (no importadas de
// application/, mismo criterio de aislamiento que el resto del proyecto).
import { apiFetch } from "@/lib/apiClient";

export type LearningPlanStatusHttp = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export interface LearningPlanHttp {
  id: string;
  studentId: string;
  name: string;
  description: string | null;
  targetLevel: string;
  startDate: string;
  endDate: string | null;
  status: LearningPlanStatusHttp;
}

export interface StudyScheduleHttp {
  id: string;
  learningPlanId: string;
  daysPerWeek: number;
  sessionsPerDay: number;
  minutesPerSession: number;
  reminderHour: number | null;
  reminderMinute: number | null;
}

// Slice "update study schedule" — el cliente nunca envía `studentId` ni
// `learningPlanId` (ver UpdateStudyScheduleHandler, sin modificar): ambos
// los resuelve el servidor a partir de la sesión Clerk verificada. La
// configuración se reemplaza completa en cada envío (no hay semántica de
// actualización parcial en el Handler) — `reminderHour`/`reminderMinute`
// ausentes juntos significa "sin recordatorio", no "sin cambios".
export interface UpdateStudyScheduleRequestHttp {
  daysPerWeek: number;
  sessionsPerDay: number;
  minutesPerSession: number;
  reminderHour?: number;
  reminderMinute?: number;
}

export interface LearningProgressHttp {
  id: string;
  learningPlanId: string;
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
  currentStreak: number;
  updatedAt: string;
}

// 4 valores, no 3: el dominio (`GoalPriority`, features/my-plan/domain/
// enums/GoalPriority.ts) y la columna Prisma (`Priority`) sí incluyen
// `CRITICAL` — a diferencia del tipo de presentación previo
// (`features/my-plan/types/myPlan.types.ts`, usado por el mock, que solo
// declaraba 3) que nunca lo ejercitó porque el mock jamás generaba ese
// valor. Con datos reales, `CRITICAL` es alcanzable (aunque hoy el único
// productor, el onboarding, siempre usa MEDIUM) — se completa aquí para
// no dejar un valor de dominio real sin representar en la capa HTTP.
export type LearningGoalPriorityHttp = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type LearningGoalStatusHttp = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface LearningGoalSummaryHttp {
  id: string;
  title: string;
  priority: LearningGoalPriorityHttp;
  status: LearningGoalStatusHttp;
}

export interface LearningGoalsHttp {
  active: LearningGoalSummaryHttp[];
  completed: LearningGoalSummaryHttp[];
}

// `LearningPhaseStatusHttp`/`LearningTaskStatusHttp` son deliberadamente 2
// tipos distintos con los mismos 4 valores — no se alias-ean entre sí ni
// con `LearningGoalStatusHttp` — mismo criterio ya usado en el dominio
// (LearningGoalStatus.ts: "modelado como tipo TypeScript propio... para no
// permitir mezclar estados entre entidades distintas").
export type LearningPhaseStatusHttp = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type LearningTaskStatusHttp = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type LearningTaskSourceHttp =
  "SELF_DIRECTED" | "ACADEMY" | "LABORATORY" | "DAILY_TRAINING" | "SIMULATOR";

// Slice "connect study session history": id/startedAt/finishedAt/
// durationMinutes/completed — mismos campos y misma serialización que
// `StudySessionMapper.toResponseDto()` (ISO string / null), sin
// `studentId`/`learningTaskId` (la tarea ya está scoped por la propia
// respuesta de fases).
export interface LearningTaskSessionSummaryHttp {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  durationMinutes: number | null;
  completed: boolean;
}

export interface LearningTaskSummaryHttp {
  id: string;
  title: string;
  status: LearningTaskStatusHttp;
  source: LearningTaskSourceHttp;
  sessions: LearningTaskSessionSummaryHttp[];
}

export interface LearningPhaseSummaryHttp {
  id: string;
  name: string;
  status: LearningPhaseStatusHttp;
  tasks: LearningTaskSummaryHttp[];
}

export interface LearningPhasesHttp {
  phases: LearningPhaseSummaryHttp[];
}

// Slice "create and finish study sessions" — forma HTTP completa
// (studentId/learningTaskId incluidos), distinta de
// `LearningTaskSessionSummaryHttp` (la versión embebida y recortada de
// GET /phases): esta es la respuesta real de crear/finalizar una sesión,
// espejo de `StudySessionResponseDto`. El cliente nunca envía
// `startedAt`/`finishedAt`/`durationMinutes` en la petición — son
// siempre parte de la RESPUESTA del servidor, nunca del request.
export interface StudySessionHttp {
  id: string;
  studentId: string;
  learningTaskId: string;
  startedAt: string;
  finishedAt: string | null;
  durationMinutes: number | null;
  completed: boolean;
}

// Slice "complete learning tasks" — espejo de `LearningTaskResponseDto`
// (respuesta real de completar una tarea), distinta de
// `LearningTaskSummaryHttp` (la versión embebida y recortada de GET
// /phases). El cliente nunca envía `status`/`completedAt` — el servidor
// decide ambos (ver CompleteLearningTaskHandler, sin modificar).
export type LearningTaskDifficultyHttp = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export interface LearningTaskHttp {
  id: string;
  learningPhaseId: string;
  title: string;
  description: string | null;
  estimatedMinutes: number;
  difficulty: LearningTaskDifficultyHttp;
  dueDate: string | null;
  completedAt: string | null;
  status: LearningTaskStatusHttp;
  source: LearningTaskSourceHttp;
}

const BASE = "/api/v1/my-plan";

export async function getActiveLearningPlan(): Promise<LearningPlanHttp> {
  return apiFetch<LearningPlanHttp>(`${BASE}/active`);
}

export async function getStudySchedule(): Promise<StudyScheduleHttp> {
  return apiFetch<StudyScheduleHttp>(`${BASE}/study-schedule`);
}

export async function updateStudySchedule(
  payload: UpdateStudyScheduleRequestHttp,
): Promise<StudyScheduleHttp> {
  return apiFetch<StudyScheduleHttp>(`${BASE}/study-schedule`, {
    method: "PATCH",
    body: payload,
  });
}

export async function getLearningProgress(): Promise<LearningProgressHttp> {
  return apiFetch<LearningProgressHttp>(`${BASE}/progress`);
}

export async function getLearningGoals(): Promise<LearningGoalsHttp> {
  return apiFetch<LearningGoalsHttp>(`${BASE}/goals`);
}

export async function getLearningPhases(): Promise<LearningPhasesHttp> {
  return apiFetch<LearningPhasesHttp>(`${BASE}/phases`);
}

export async function createStudySession(taskId: string): Promise<StudySessionHttp> {
  return apiFetch<StudySessionHttp>(`${BASE}/tasks/${taskId}/sessions`, { method: "POST" });
}

export async function finishStudySession(sessionId: string): Promise<StudySessionHttp> {
  return apiFetch<StudySessionHttp>(`${BASE}/sessions/${sessionId}/finish`, { method: "POST" });
}

export async function completeLearningTask(taskId: string): Promise<LearningTaskHttp> {
  return apiFetch<LearningTaskHttp>(`${BASE}/tasks/${taskId}/complete`, { method: "POST" });
}
