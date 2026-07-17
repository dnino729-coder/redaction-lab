"use client";
// PlanSummaryCard — bloque 3 "Mi Plan (resumen)" (sección 2 y 4). Horas
// recomendadas semanales, sesiones completadas/pendientes (aproximado por
// minutos, únicos datos disponibles en esta fase — ver LearningPlanSummary),
// objetivo diario, progreso semanal.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar } from "@/components/ui";
import { clampPercentage, formatMinutesAsHoursLabel } from "../utils/dashboard.utils";
import type { PlanSummaryBlock } from "../types";

export interface PlanSummaryCardProps {
  plan: PlanSummaryBlock;
}

export function PlanSummaryCard({ plan }: PlanSummaryCardProps) {
  const t = useTranslations("dashboard.plan");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!plan.hasActivePlan ? (
          <p className="text-sm text-neutral-500">{t("noPlan")}</p>
        ) : (
          <>
            {plan.weeklyCompletionPercentage !== null ? (
              <ProgressBar
                label={t("weeklyGoal")}
                value={clampPercentage(plan.weeklyCompletionPercentage)}
                tone="primary"
              />
            ) : null}

            {plan.weeklyCompletedMinutes !== null && plan.weeklyRecommendedMinutes !== null ? (
              <p className="text-sm text-neutral-600">
                {t("minutesCompleted", {
                  completed: formatMinutesAsHoursLabel(plan.weeklyCompletedMinutes),
                  total: formatMinutesAsHoursLabel(plan.weeklyRecommendedMinutes),
                })}
              </p>
            ) : null}

            {plan.dailyGoalMinutes !== null ? (
              <p className="text-xs text-neutral-500">
                {t("dailyGoal")}: {formatMinutesAsHoursLabel(plan.dailyCompletedMinutes ?? 0)} /{" "}
                {formatMinutesAsHoursLabel(plan.dailyGoalMinutes)}
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
