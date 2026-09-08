// Transporte REST del onboarding de perfil — mismo patrón que
// features/my-plan/services/myPlanApi.ts: apiFetch genérico compartido,
// formas HTTP propias del frontend (no importadas de application/).
import { apiFetch } from "@/lib/apiClient";

export type CefrLevelHttp = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface CompleteStudentOnboardingInput {
  currentLevel: CefrLevelHttp;
  targetLevel: CefrLevelHttp;
  nativeLanguage: string;
  learningGoal: string;
  daysPerWeek: number;
  sessionsPerDay: number;
  minutesPerSession: number;
  reminderHour?: number | null;
  reminderMinute?: number | null;
  targetExamDate?: string | null;
}

export interface StudentProfileHttp {
  id: string;
  studentId: string;
  currentLevel: CefrLevelHttp;
  targetLevel: CefrLevelHttp;
  nativeLanguage: string;
  learningGoal: string | null;
  targetExamDate: string | null;
}

export interface CompleteStudentOnboardingResultHttp {
  studentProfile: StudentProfileHttp;
  learningPlanId: string;
}

const BASE = "/api/v1/profile";

export async function completeStudentOnboarding(
  input: CompleteStudentOnboardingInput,
): Promise<CompleteStudentOnboardingResultHttp> {
  return apiFetch<CompleteStudentOnboardingResultHttp>(`${BASE}/onboarding`, {
    method: "POST",
    body: input,
  });
}
