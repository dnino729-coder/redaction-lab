"use client";
// EvaluationResultPanel — pantalla 5 "Évaluation". Resultado tras la
// entrega: nota total y desglose por criterio DELF.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge, ProgressBar } from "@/components/ui";
import type { EvaluationBlock } from "../types";

export interface EvaluationResultPanelProps {
  evaluation: EvaluationBlock;
}

export function EvaluationResultPanel({ evaluation }: EvaluationResultPanelProps) {
  const t = useTranslations("simulator.evaluation");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Badge variant="primary">{t("totalScore", { score: evaluation.totalScore, max: evaluation.maxScore })}</Badge>

        <ul className="flex flex-col gap-3">
          {evaluation.criteria.map((criterion) => (
            <li key={criterion.criterion}>
              <ProgressBar
                label={criterion.criterion}
                value={(criterion.score / criterion.maxScore) * 100}
                tone="primary"
              />
              <p className="mt-1 text-xs text-neutral-500">
                {t("criterionScore", { score: criterion.score, max: criterion.maxScore })}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
