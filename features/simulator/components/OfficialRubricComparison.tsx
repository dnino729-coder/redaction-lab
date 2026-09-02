"use client";
// OfficialRubricComparison — pantalla 6 "Analyse des résultats". Comparación
// con la rúbrica oficial DELF B2, comentarios por criterio, comparación con
// el mejor intento previo.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { AnalysisBlock } from "../types";

export interface OfficialRubricComparisonProps {
  analysis: AnalysisBlock;
}

export function OfficialRubricComparison({ analysis }: OfficialRubricComparisonProps) {
  const t = useTranslations("simulator.analysis");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {analysis.previousBestScore !== null ? (
          <p className="text-sm text-neutral-600">
            {t("comparedToPrevious", { score: analysis.previousBestScore, max: analysis.maxScore })}
          </p>
        ) : null}

        <ul className="flex flex-col gap-3">
          {analysis.rubricDetails.map((detail) => (
            <li key={detail.criterion} className="rounded-md border border-neutral-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-neutral-800">{detail.criterion}</span>
                <Badge variant="primary">{detail.levelAchieved}</Badge>
              </div>
              <p className="mt-1 text-sm text-neutral-600">{detail.comment}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
