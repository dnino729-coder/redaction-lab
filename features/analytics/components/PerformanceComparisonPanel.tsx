"use client";
// PerformanceComparisonPanel — bloque 5 "Comparaison des performances".
// Último resultado vs. mejor resultado vs. historial reciente.
import { useTranslations, useFormatter } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { PerformanceComparisonBlock } from "../types";

export interface PerformanceComparisonPanelProps {
  performance: PerformanceComparisonBlock;
}

export function PerformanceComparisonPanel({ performance }: PerformanceComparisonPanelProps) {
  const t = useTranslations("analytics.performance");
  const format = useFormatter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary">{t("latestScore", { score: performance.latestScore, max: performance.maxScore })}</Badge>
          <Badge variant="success">{t("bestScore", { score: performance.bestScore, max: performance.maxScore })}</Badge>
        </div>

        {performance.recentAttempts.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {performance.recentAttempts.map((attempt) => (
              <li key={attempt.id} className="flex items-center justify-between gap-3 text-sm text-neutral-600">
                <span>{format.dateTime(new Date(attempt.date), { dateStyle: "long" })}</span>
                <span>{t("attemptScore", { score: attempt.score, max: attempt.maxScore })}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
