// Repositorio: Plan de Aprendizaje (13.4). Envuelve database/queries con una
// interfaz orientada a entidad; no contiene reglas de negocio — ver
// ARCHITECTURE.md, sección 2.1.

import { queryActiveLearningPlan } from "@/database/queries/learningPlan";
import type { StudentScopedClient } from "./withStudentContext";

export interface LearningPlanSummary {
  planId: string;
  targetLevel: string;
  weeklyRecommendedMinutes: number | null;
  weeklyCompletedMinutes: number | null;
  weeklyCompletionPercentage: number | null;
  dailyGoalMinutes: number | null;
  dailyCompletedMinutes: number | null;
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
}

export async function findActiveLearningPlanSummary(
  tx: StudentScopedClient,
  studentId: string,
): Promise<LearningPlanSummary | null> {
  const plan = await queryActiveLearningPlan(tx, studentId);
  if (!plan) return null;

  const latestWeek = plan.weeklyPlans[0];
  const latestDay = plan.dailyPlans[0];

  return {
    planId: plan.id,
    targetLevel: plan.targetLevel,
    weeklyRecommendedMinutes: latestWeek?.estimatedMinutes ?? null,
    weeklyCompletedMinutes: latestWeek?.completedMinutes ?? null,
    weeklyCompletionPercentage: latestWeek ? Number(latestWeek.completionPercentage) : null,
    dailyGoalMinutes: latestDay?.estimatedMinutes ?? null,
    dailyCompletedMinutes: latestDay?.completedMinutes ?? null,
    completedTasks: plan.learningProgress?.completedTasks ?? 0,
    totalTasks: plan.learningProgress?.totalTasks ?? 0,
    completionPercentage: plan.learningProgress ? Number(plan.learningProgress.completionPercentage) : 0,
  };
}
