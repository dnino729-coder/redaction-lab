"use client";
// PlanConfiguration — bloque 5 "Configuración del plan"
// (docs/modules/mi-plan.md, Vacío 1). Ya no recibe `configuration` por
// props: se autoalimenta desde GetStudyScheduleHandler vía
// useStudySchedule() (mismo patrón que PlanSummaryOverview, vertical
// slice 1). `preferences` no tiene equivalente en el DTO real
// (StudyScheduleResponseDto) — se omite en vez de simular datos que no
// existen. El punto de entrada a la reprogramación (Vacío 2) sigue
// deshabilitado: sin Learning Planner implementado todavía.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { ApiError } from "@/lib/apiClient";
import { useStudySchedule } from "../hooks/useStudySchedule";
import { MyPlanSkeleton } from "./MyPlanSkeleton";
import { MyPlanErrorState } from "./MyPlanErrorState";
import { MyPlanEmptyState } from "./MyPlanEmptyState";

function formatReminder(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function PlanConfiguration() {
  const t = useTranslations("myPlan.configuration");
  const { data: schedule, isLoading, isError, error, refetch } = useStudySchedule();

  if (isLoading) return <MyPlanSkeleton />;
  if (error instanceof ApiError && error.status === 404) return <MyPlanEmptyState />;
  if (isError || !schedule) return <MyPlanErrorState onRetry={() => refetch()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-neutral-500">{t("daysPerWeek")}</dt>
            <dd className="text-sm font-medium text-neutral-800">{schedule.daysPerWeek}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">{t("sessionsPerDay")}</dt>
            <dd className="text-sm font-medium text-neutral-800">{schedule.sessionsPerDay}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">{t("minutesPerSession")}</dt>
            <dd className="text-sm font-medium text-neutral-800">{schedule.minutesPerSession}</dd>
          </div>
        </dl>

        {schedule.reminderHour !== null && schedule.reminderMinute !== null ? (
          <p className="text-sm text-neutral-600">
            {t("reminder", {
              time: formatReminder(schedule.reminderHour, schedule.reminderMinute),
            })}
          </p>
        ) : null}

        <div className="border-t border-neutral-200 pt-4">
          <Button variant="outline" disabled title={t("reorganizeDisabledHint")}>
            {t("reorganizeCta")}
          </Button>
          <p className="mt-2 text-xs text-neutral-500">{t("reorganizeDisabledHint")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
