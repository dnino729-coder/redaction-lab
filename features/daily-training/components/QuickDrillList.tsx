"use client";
// QuickDrillList — bloque 3 "Exercices rapides". Drills cortos agrupados
// por nivel (Facile/Intermédiaire/Avancé).
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { DrillLevel, QuickDrillItem, QuickDrillsBlock } from "../types";

export interface QuickDrillListProps {
  quickDrills: QuickDrillsBlock;
}

const LEVEL_ORDER: DrillLevel[] = ["EASY", "INTERMEDIATE", "ADVANCED"];

export function QuickDrillList({ quickDrills }: QuickDrillListProps) {
  const t = useTranslations("dailyTraining.quickDrills");

  function renderLevel(level: DrillLevel, items: QuickDrillItem[]) {
    return (
      <div key={level} className={level !== "EASY" ? "border-t border-neutral-200 pt-4" : undefined}>
        <h3 className="mb-2 text-sm font-medium text-neutral-700">{t(`level.${level}`)}</h3>
        {items.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((drill) => (
              <li key={drill.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-neutral-700">{drill.title}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">{t("minutes", { count: drill.estimatedMinutes })}</span>
                  <Badge variant={drill.completed ? "success" : "neutral"}>
                    {t(drill.completed ? "done" : "pending")}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {LEVEL_ORDER.map((level) =>
          renderLevel(
            level,
            quickDrills.drills.filter((drill) => drill.level === level),
          ),
        )}
      </CardContent>
    </Card>
  );
}
