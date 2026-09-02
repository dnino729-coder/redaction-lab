"use client";
// EvolutionOverviewCard — bloque 1 "Vue d'ensemble des progrès". Nivel
// actual/objetivo, nota media reciente, competencia más fuerte y más débil.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { EvolutionOverviewBlock } from "../types";

export interface EvolutionOverviewCardProps {
  overview: EvolutionOverviewBlock;
}

export function EvolutionOverviewCard({ overview }: EvolutionOverviewCardProps) {
  const t = useTranslations("analytics.overview");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {overview.currentLevel ? <Badge variant="primary">{t("currentLevel", { level: overview.currentLevel })}</Badge> : null}
          {overview.targetLevel ? <Badge variant="neutral">{t("targetLevel", { level: overview.targetLevel })}</Badge> : null}
        </div>

        <p className="text-sm text-neutral-600">
          {t("averageScore", { score: overview.averageRecentScore, max: overview.maxScore })}
        </p>

        <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
          <span>{t("strongest", { competency: overview.strongestCompetency })}</span>
          <span>{t("weakest", { competency: overview.weakestCompetency })}</span>
        </div>
      </CardContent>
    </Card>
  );
}
