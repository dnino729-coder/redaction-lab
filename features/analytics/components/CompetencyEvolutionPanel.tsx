"use client";
// CompetencyEvolutionPanel — bloque 2 "Évolution des compétences". Muestra
// TENDENCIA por competencia (sube/baja/estable), no un valor absoluto —
// eso ya lo cubre el Dashboard (EvolutionSummaryPanel).
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { CompetencyCategory, CompetencyEvolutionBlock, CompetencyTrend } from "../types";

export interface CompetencyEvolutionPanelProps {
  competencies: CompetencyEvolutionBlock;
}

const CATEGORY_ORDER: CompetencyCategory[] = [
  "GRAMMAR",
  "LEXICAL",
  "COHESION",
  "CONNECTORS",
  "TEXT_ORGANIZATION",
];

function trendVariant(trend: CompetencyTrend): "success" | "danger" | "neutral" {
  if (trend === "UP") return "success";
  if (trend === "DOWN") return "danger";
  return "neutral";
}

export function CompetencyEvolutionPanel({ competencies }: CompetencyEvolutionPanelProps) {
  const t = useTranslations("analytics.competencies");

  const byCategory = new Map(competencies.competencies.map((item) => [item.category, item]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {competencies.competencies.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {CATEGORY_ORDER.filter((category) => byCategory.has(category)).map((category) => {
              const item = byCategory.get(category)!;
              return (
                <li key={category} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-neutral-700">{t(`category.${category}`)}</span>
                  <Badge variant={trendVariant(item.trend)}>
                    {t(`trend.${item.trend}`, { percentage: Math.abs(item.changePercentage) })}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
