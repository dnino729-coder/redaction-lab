"use client";
// LearningProgressOverview — bloque 6 "Progreso" (nuevo, vertical slice
// #3). Se autoalimenta desde GetLearningProgressHandler vía
// useLearningProgress() (mismo patrón que PlanSummaryOverview/
// PlanConfiguration). Muestra % de avance, tareas completadas/totales y
// racha actual — los tres campos escalares del DTO real
// (LearningProgressResponseDto). `updatedAt` no tiene un patrón visual
// establecido en los bloques existentes, se omite.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar } from "@/components/ui";
import { ApiError } from "@/lib/apiClient";
import { useLearningProgress } from "../hooks/useLearningProgress";
import { MyPlanSkeleton } from "./MyPlanSkeleton";
import { MyPlanErrorState } from "./MyPlanErrorState";
import { MyPlanEmptyState } from "./MyPlanEmptyState";

export function LearningProgressOverview() {
  const t = useTranslations("myPlan.progress");
  const { data: progress, isLoading, isError, error, refetch } = useLearningProgress();

  if (isLoading) return <MyPlanSkeleton />;
  if (error instanceof ApiError && error.status === 404) return <MyPlanEmptyState />;
  if (isError || !progress) return <MyPlanErrorState onRetry={() => refetch()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ProgressBar
          label={t("completionLabel")}
          value={progress.completionPercentage}
          tone="primary"
        />

        <p className="text-sm text-neutral-600">
          {t("tasksCompleted", { completed: progress.completedTasks, total: progress.totalTasks })}
        </p>

        <p className="text-sm text-neutral-600">
          {t("currentStreak", { count: progress.currentStreak })}
        </p>
      </CardContent>
    </Card>
  );
}
