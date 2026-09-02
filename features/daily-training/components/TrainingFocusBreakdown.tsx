"use client";
// TrainingFocusBreakdown — bloque 5 "Progression par compétence". Frecuencia
// de práctica por categoría, 5 categorías separadas (Grammaire ≠ Lexique).
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar } from "@/components/ui";
import type { TrainingFocusBlock, TrainingFocusCategory } from "../types";

export interface TrainingFocusBreakdownProps {
  focus: TrainingFocusBlock;
}

const CATEGORY_ORDER: TrainingFocusCategory[] = [
  "GRAMMAR",
  "LEXICAL",
  "COHESION",
  "CONNECTORS",
  "TEXT_ORGANIZATION",
];

export function TrainingFocusBreakdown({ focus }: TrainingFocusBreakdownProps) {
  const t = useTranslations("dailyTraining.focus");

  const byCategory = new Map(focus.items.map((item) => [item.category, item.practiceFrequency]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {focus.items.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {CATEGORY_ORDER.filter((category) => byCategory.has(category)).map((category) => (
              <li key={category}>
                <ProgressBar
                  label={t(`category.${category}`)}
                  value={byCategory.get(category) ?? 0}
                  tone="primary"
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
