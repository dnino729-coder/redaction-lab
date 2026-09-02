"use client";
// TrainingSummaryOverview — bloque 1 "Résumé de l'entraînement". Racha,
// desafíos completados hoy/semana, % de la meta diaria.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar, Badge } from "@/components/ui";
import type { TrainingSummaryBlock } from "../types";

export interface TrainingSummaryOverviewProps {
  summary: TrainingSummaryBlock;
}

export function TrainingSummaryOverview({ summary }: TrainingSummaryOverviewProps) {
  const t = useTranslations("dailyTraining.summary");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary">{t("streak", { count: summary.currentStreak })}</Badge>
        </div>

        <ProgressBar label={t("dailyGoal")} value={summary.dailyGoalPercentage} tone="primary" />

        <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
          <span>{t("completedToday", { count: summary.challengesCompletedToday })}</span>
          <span>{t("completedThisWeek", { count: summary.challengesCompletedThisWeek })}</span>
        </div>
      </CardContent>
    </Card>
  );
}
