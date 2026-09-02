"use client";
// SimulatorOverview — pantalla 0 "Vue d'ensemble du simulateur" (persistente,
// no forma parte de la sesión de examen). Historial de intentos, mejor nota.
import { useTranslations, useFormatter } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { SimulatorOverviewBlock } from "../types";

export interface SimulatorOverviewProps {
  overview: SimulatorOverviewBlock;
}

export function SimulatorOverview({ overview }: SimulatorOverviewProps) {
  const t = useTranslations("simulator.overview");
  const tTextType = useTranslations("simulator.textType");
  const format = useFormatter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
          <span>{t("attemptsCompleted", { count: overview.attemptsCompleted })}</span>
          <span>{t("bestScore", { score: overview.bestScore, max: overview.maxScore })}</span>
        </div>

        {overview.history.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {overview.history.map((attempt) => (
              <li key={attempt.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-neutral-700">
                  {tTextType(attempt.textType)} · {format.dateTime(new Date(attempt.date), { dateStyle: "long" })}
                </span>
                <Badge variant="neutral">{t("scoreBadge", { score: attempt.score, max: attempt.maxScore })}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
