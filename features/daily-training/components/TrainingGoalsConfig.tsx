"use client";
// TrainingGoalsConfig — bloque 6 "Objectifs d'entraînement". Meta diaria y
// semanal actuales, con una sugerencia visible pero no aplicada
// automáticamente — el estudiante conserva el control (mismo principio ya
// aplicado en Mi Plan, "las recomendaciones son sugerencias, no obligaciones").
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { TrainingGoalsBlock } from "../types";

export interface TrainingGoalsConfigProps {
  goals: TrainingGoalsBlock;
}

export function TrainingGoalsConfig({ goals }: TrainingGoalsConfigProps) {
  const t = useTranslations("dailyTraining.goals");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-neutral-500">{t("dailyChallengeGoal")}</dt>
            <dd className="text-sm font-medium text-neutral-800">
              {t("challengeCount", { count: goals.dailyChallengeGoal })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">{t("weeklyMinutesGoal")}</dt>
            <dd className="text-sm font-medium text-neutral-800">{t("minutes", { count: goals.weeklyMinutesGoal })}</dd>
          </div>
        </dl>

        {goals.suggestedDailyChallengeGoal !== goals.dailyChallengeGoal ? (
          <div className="flex items-center gap-2">
            <Badge variant="neutral">{t("suggestion")}</Badge>
            <span className="text-sm text-neutral-600">
              {t("suggestedChallengeGoal", { count: goals.suggestedDailyChallengeGoal })}
            </span>
          </div>
        ) : null}

        <p className="text-xs text-neutral-500">{t("controlHint")}</p>
      </CardContent>
    </Card>
  );
}
