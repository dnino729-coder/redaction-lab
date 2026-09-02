"use client";
// ErrorFrequencyBreakdown — bloque 4 "Analyse des erreurs". Patrones
// recurrentes (frecuencia relativa), no un error aislado de una corrección
// puntual.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar } from "@/components/ui";
import type { ErrorAnalysisBlock } from "../types";

export interface ErrorFrequencyBreakdownProps {
  errors: ErrorAnalysisBlock;
}

export function ErrorFrequencyBreakdown({ errors }: ErrorFrequencyBreakdownProps) {
  const t = useTranslations("analytics.errors");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {errors.errors.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {errors.errors.map((error) => (
              <li key={error.description}>
                <ProgressBar
                  label={`${t(`category.${error.category}`)} — ${error.description}`}
                  value={error.frequencyPercentage}
                  tone="warning"
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
