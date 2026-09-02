"use client";
// PlanSummaryOverview — bloque 1 "Resumen general" (docs/modules/mi-plan.md,
// Vacío 1). Objetivo, cuenta regresiva al examen, horas estudiadas vs.
// recomendadas, % de avance del plan.
import { useTranslations, useFormatter } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar, Badge } from "@/components/ui";
import type { PlanSummaryBlock } from "../types";

export interface PlanSummaryOverviewProps {
  summary: PlanSummaryBlock;
}

export function PlanSummaryOverview({ summary }: PlanSummaryOverviewProps) {
  const t = useTranslations("myPlan.summary");
  const format = useFormatter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {summary.currentLevel ? <Badge variant="primary">{t("currentLevel", { level: summary.currentLevel })}</Badge> : null}
          {summary.targetLevel ? <Badge variant="neutral">{t("targetLevel", { level: summary.targetLevel })}</Badge> : null}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-neutral-700">
            {summary.daysUntilExam !== null ? t("examIn", { days: summary.daysUntilExam }) : t("noExamDate")}
          </p>
          {summary.targetExamDate ? (
            <p className="text-xs text-neutral-500">
              {t("examDate", { date: format.dateTime(new Date(summary.targetExamDate), { dateStyle: "long" }) })}
            </p>
          ) : null}
        </div>

        <ProgressBar label={t("progress")} value={summary.completionPercentage} tone="primary" />

        <p className="text-sm text-neutral-600">
          {t("hoursStudied", {
            done: summary.totalStudyHours.toFixed(1),
            weekly: summary.recommendedWeeklyHours.toFixed(1),
          })}
        </p>
      </CardContent>
    </Card>
  );
}
