"use client";
// GoalsAndObjectives — bloque 3 "Objetivos y metas" (docs/modules/mi-plan.md,
// Vacío 1). Se autoalimenta desde GetLearningGoalsHandler vía
// useLearningGoals() (mismo patrón que PlanSummaryOverview/PlanConfiguration/
// LearningProgressOverview) — ya no recibe `goals` como prop/mock. Muestra
// LearningGoal (con prioridad) reales, activos y completados.
//
// LearningObjective NO se consume aquí — la auditoría confirmó que esta UI
// nunca los renderizó, pese al nombre del componente (fuera de alcance de
// este slice).
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { ApiError } from "@/lib/apiClient";
import type { LearningGoalPriorityHttp } from "../services/myPlanApi";
import { useLearningGoals } from "../hooks/useLearningGoals";
import { MyPlanSkeleton } from "./MyPlanSkeleton";
import { MyPlanErrorState } from "./MyPlanErrorState";
import { MyPlanEmptyState } from "./MyPlanEmptyState";

function priorityVariant(priority: LearningGoalPriorityHttp): "danger" | "warning" | "neutral" {
  // CRITICAL comparte el tier visual más alto con HIGH — el primitivo
  // Badge no distingue un quinto nivel ("danger" es su variante más
  // fuerte), y no se justifica crear uno nuevo solo para este slice.
  if (priority === "HIGH" || priority === "CRITICAL") return "danger";
  if (priority === "MEDIUM") return "warning";
  return "neutral";
}

export function GoalsAndObjectives() {
  const t = useTranslations("myPlan.goals");
  const { data: goals, isLoading, isError, error, refetch } = useLearningGoals();

  if (isLoading) return <MyPlanSkeleton />;
  if (error instanceof ApiError && error.status === 404) return <MyPlanEmptyState />;
  if (isError || !goals) return <MyPlanErrorState onRetry={() => refetch()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <h3 className="mb-2 text-sm font-medium text-neutral-700">
            {t("activeTitle", { count: goals.active.length })}
          </h3>
          {goals.active.length === 0 ? (
            <p className="text-sm text-neutral-500">{t("activeEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {goals.active.map((goal) => (
                <li key={goal.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-neutral-700">{goal.title}</span>
                  <Badge variant={priorityVariant(goal.priority)}>
                    {t(`priority.${goal.priority}`)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-neutral-200 pt-4">
          <h3 className="mb-2 text-sm font-medium text-neutral-700">
            {t("completedTitle", { count: goals.completed.length })}
          </h3>
          {goals.completed.length === 0 ? (
            <p className="text-sm text-neutral-500">{t("completedEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {goals.completed.map((goal) => (
                <li
                  key={goal.id}
                  className="flex items-center gap-2 text-sm text-neutral-400 line-through"
                >
                  {goal.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
