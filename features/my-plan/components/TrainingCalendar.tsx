"use client";
// TrainingCalendar — bloque 2 "Calendario de entrenamiento"
// (docs/modules/mi-plan.md, Vacío 1). Vista de DailyPlan/WeeklyPlan.
import { useTranslations, useFormatter } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { TrainingCalendarBlock } from "../types";

export interface TrainingCalendarProps {
  calendar: TrainingCalendarBlock;
}

export function TrainingCalendar({ calendar }: TrainingCalendarProps) {
  const t = useTranslations("myPlan.calendar");
  const format = useFormatter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <h3 className="mb-2 text-sm font-medium text-neutral-700">{t("dailyTitle")}</h3>
          {calendar.daily.length === 0 ? (
            <p className="text-sm text-neutral-500">{t("dailyEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {calendar.daily.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className={item.completed ? "text-neutral-400 line-through" : "text-neutral-700"}>
                    {item.title}
                  </span>
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-xs text-neutral-500">{t("minutes", { count: item.estimatedMinutes })}</span>
                    <Badge variant={item.completed ? "success" : "neutral"}>
                      {t(item.completed ? "done" : "pending")}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-neutral-200 pt-4">
          <h3 className="mb-2 text-sm font-medium text-neutral-700">{t("weeklyTitle")}</h3>
          {calendar.weekly.length === 0 ? (
            <p className="text-sm text-neutral-500">{t("weeklyEmpty")}</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {calendar.weekly.map((day) => (
                <li key={day.date} className="rounded-md border border-neutral-200 p-3">
                  <p className="text-xs font-medium text-neutral-500">
                    {day.label} · {format.dateTime(new Date(day.date), { day: "numeric", month: "short" })}
                  </p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {day.items.map((item) => (
                      <li key={item.id} className="text-sm text-neutral-700">
                        {item.title}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
