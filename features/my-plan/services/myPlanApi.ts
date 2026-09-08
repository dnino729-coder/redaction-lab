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

const BASE = "/api/v1/my-plan";

export async function getActiveLearningPlan(): Promise<LearningPlanHttp> {
  return apiFetch<LearningPlanHttp>(`${BASE}/active`);
}

export async function getStudySchedule(): Promise<StudyScheduleHttp> {
  return apiFetch<StudyScheduleHttp>(`${BASE}/study-schedule`);
}
