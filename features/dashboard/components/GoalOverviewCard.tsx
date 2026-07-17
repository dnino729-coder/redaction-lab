"use client";
// GoalOverviewCard — bloque 2 "Mi objetivo" (sección 2 y 4). Fecha prevista
// del examen, días restantes, % general de preparación, nivel estimado de
// desempeño, avance hacia la meta.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar, Badge } from "@/components/ui";
import { clampPercentage } from "../utils/dashboard.utils";
import type { GoalBlock } from "../types";

export interface GoalOverviewCardProps {
  goal: GoalBlock;
}

export function GoalOverviewCard({ goal }: GoalOverviewCardProps) {
  const t = useTranslations("dashboard.goal");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {goal.currentLevel ? <Badge variant="primary">{t("currentLevel", { level: goal.currentLevel })}</Badge> : null}
          {goal.targetLevel ? <Badge variant="neutral">{t("targetLevel", { level: goal.targetLevel })}</Badge> : null}
        </div>

        <p className="text-sm text-neutral-700">
          {goal.daysUntilExam !== null ? t("examIn", { days: goal.daysUntilExam }) : t("noExamDate")}
        </p>

        {goal.overallPreparationPercentage !== null ? (
          <ProgressBar
            label={t("preparation")}
            value={clampPercentage(goal.overallPreparationPercentage)}
            tone="primary"
          />
        ) : null}

        {goal.estimatedPerformance ? (
          <p className="text-sm text-neutral-600">
            {t("estimatedPerformance", { score: goal.estimatedPerformance.finalScore.toFixed(1) })}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
