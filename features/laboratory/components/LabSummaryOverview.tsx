"use client";
// LabSummaryOverview — bloque 1 "Résumé du laboratoire". Nivel actual/objetivo,
// textos completados, racha, tipo de texto trabajado, % de avance.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar, Badge } from "@/components/ui";
import type { LabSummaryBlock } from "../types";

export interface LabSummaryOverviewProps {
  summary: LabSummaryBlock;
}

export function LabSummaryOverview({ summary }: LabSummaryOverviewProps) {
  const t = useTranslations("laboratory.summary");
  const tTextType = useTranslations("laboratory.textType");

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

        <ProgressBar label={t("progress")} value={summary.completionPercentage} tone="primary" />

        <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
          <span>{t("textsCompleted", { count: summary.textsCompleted })}</span>
          <span>{t("streak", { count: summary.currentStreak })}</span>
          {summary.lastTextType ? <span>{t("lastTextType", { type: tTextType(summary.lastTextType) })}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
