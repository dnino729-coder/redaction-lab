"use client";
// ChallengeHistoryCalendar — bloque 4 "Historique des défis". Consistencia
// en el tiempo (últimos días), racha semanal.
import { useTranslations, useFormatter } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { ChallengeHistoryBlock } from "../types";

export interface ChallengeHistoryCalendarProps {
  history: ChallengeHistoryBlock;
}

export function ChallengeHistoryCalendar({ history }: ChallengeHistoryCalendarProps) {
  const t = useTranslations("dailyTraining.history");
  const format = useFormatter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {history.days.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          <ul className="grid grid-cols-5 gap-2">
            {history.days.map((day) => (
              <li
                key={day.date}
                className="flex flex-col items-center gap-1 rounded-md border border-neutral-200 p-2 text-center"
              >
                <span className="text-xs text-neutral-500">
                  {format.dateTime(new Date(day.date), { day: "numeric", month: "short" })}
                </span>
                <Badge variant={day.completed ? "success" : "neutral"}>
                  {t(day.completed ? "done" : "missed")}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-neutral-600">{t("weeklyStreak", { count: history.weeklyStreak })}</p>
      </CardContent>
    </Card>
  );
}
