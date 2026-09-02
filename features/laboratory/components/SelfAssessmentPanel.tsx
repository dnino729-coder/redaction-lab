"use client";
// SelfAssessmentPanel — bloque 6 "Autoévaluation". Historial de
// autoevaluaciones con checklist de criterios cumplidos/no cumplidos.
import { useTranslations, useFormatter } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { SelfAssessmentBlock } from "../types";

export interface SelfAssessmentPanelProps {
  selfAssessment: SelfAssessmentBlock;
}

export function SelfAssessmentPanel({ selfAssessment }: SelfAssessmentPanelProps) {
  const t = useTranslations("laboratory.selfAssessment");
  const format = useFormatter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {selfAssessment.history.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {selfAssessment.history.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-neutral-800">{entry.exerciseTitle}</span>
                  <span className="text-xs text-neutral-500">
                    {format.dateTime(new Date(entry.date), { dateStyle: "long" })}
                  </span>
                </div>
                <ul className="flex flex-col gap-1">
                  {entry.criteria.map((criterion) => (
                    <li key={criterion.label} className="flex items-center gap-2 text-sm text-neutral-600">
                      <Badge variant={criterion.met ? "success" : "neutral"}>
                        {t(criterion.met ? "met" : "notMet")}
                      </Badge>
                      {criterion.label}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
