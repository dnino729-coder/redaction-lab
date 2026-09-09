"use client";
// PlanConfiguration — bloque 5 "Configuración del plan"
// (docs/modules/mi-plan.md, Vacío 1). Se autoalimenta desde
// GetStudyScheduleHandler vía useStudySchedule() (mismo patrón que
// PlanSummaryOverview, vertical slice 1). `preferences` no tiene
// equivalente en el DTO real (StudyScheduleResponseDto) — se omite en vez
// de simular datos que no existen. El punto de entrada a la
// reprogramación (Vacío 2) sigue deshabilitado: sin Learning Planner
// implementado todavía.
//
// Editar el horario (slice "update study schedule"): el bloque, antes de
// solo lectura, ahora es un formulario editable que reutiliza
// UpdateStudyScheduleHandler (sin modificar) vía useUpdateStudySchedule().
// El estado local del formulario se inicializa/resincroniza desde
// `schedule` (useEffect) — nunca se muta manualmente `daysPerWeek`/etc.
// tras el envío: el formulario vuelve a reflejar los valores reales una
// vez la mutación invalida `myPlanKeys.studySchedule()` y useStudySchedule()
// vuelve a leer el servidor. El envío siempre incluye los 5 campos
// (reemplazo completo, no hay semántica de parche parcial en el Handler).
// Mismo patrón de input/clase que
// features/profile/components/StudentOnboardingForm.tsx (components/ui no
// incluye un primitivo Input dedicado, ver ese archivo).
import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { ApiError } from "@/lib/apiClient";
import { useStudySchedule } from "../hooks/useStudySchedule";
import { useUpdateStudySchedule } from "../hooks/useUpdateStudySchedule";
import { MyPlanSkeleton } from "./MyPlanSkeleton";
import { MyPlanErrorState } from "./MyPlanErrorState";
import { MyPlanEmptyState } from "./MyPlanEmptyState";

// Mismo className que components/ui/Textarea.tsx / StudentOnboardingForm.tsx.
const INPUT_CLASS =
  "flex w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-sm text-neutral-800 " +
  "placeholder:text-neutral-400 transition-colors duration-150 ease-delf-ease focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50";

function formatReminder(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function PlanConfiguration() {
  const t = useTranslations("myPlan.configuration");
  const { data: schedule, isLoading, isError, error, refetch } = useStudySchedule();
  const updateSchedule = useUpdateStudySchedule();

  const [daysPerWeek, setDaysPerWeek] = useState(1);
  const [sessionsPerDay, setSessionsPerDay] = useState(1);
  const [minutesPerSession, setMinutesPerSession] = useState(1);
  const [reminderTime, setReminderTime] = useState("");

  // Resincroniza el formulario con los valores reales del servidor —
  // tanto en la carga inicial como después de que una mutación exitosa
  // invalide la query y useStudySchedule() traiga el nuevo `schedule`.
  useEffect(() => {
    if (!schedule) return;
    setDaysPerWeek(schedule.daysPerWeek);
    setSessionsPerDay(schedule.sessionsPerDay);
    setMinutesPerSession(schedule.minutesPerSession);
    setReminderTime(
      schedule.reminderHour !== null && schedule.reminderMinute !== null
        ? formatReminder(schedule.reminderHour, schedule.reminderMinute)
        : "",
    );
  }, [schedule]);

  if (isLoading) return <MyPlanSkeleton />;
  if (error instanceof ApiError && error.status === 404) return <MyPlanEmptyState />;
  if (isError || !schedule) return <MyPlanErrorState onRetry={() => refetch()} />;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (updateSchedule.isPending) return;

    const [reminderHour, reminderMinute] = reminderTime
      ? reminderTime.split(":").map((part) => Number(part))
      : [undefined, undefined];

    updateSchedule.mutate({
      daysPerWeek,
      sessionsPerDay,
      minutesPerSession,
      reminderHour,
      reminderMinute,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-neutral-500">{t("daysPerWeek")}</span>
              <input
                type="number"
                className={INPUT_CLASS}
                min={1}
                max={7}
                value={daysPerWeek}
                onChange={(event) => setDaysPerWeek(Number(event.target.value))}
                disabled={updateSchedule.isPending}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-neutral-500">{t("sessionsPerDay")}</span>
              <input
                type="number"
                className={INPUT_CLASS}
                min={1}
                max={24}
                value={sessionsPerDay}
                onChange={(event) => setSessionsPerDay(Number(event.target.value))}
                disabled={updateSchedule.isPending}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-neutral-500">{t("minutesPerSession")}</span>
              <input
                type="number"
                className={INPUT_CLASS}
                min={1}
                max={1440}
                value={minutesPerSession}
                onChange={(event) => setMinutesPerSession(Number(event.target.value))}
                disabled={updateSchedule.isPending}
                required
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs text-neutral-500">{t("reminderLabel")}</span>
            <input
              type="time"
              className={INPUT_CLASS}
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value)}
              disabled={updateSchedule.isPending}
            />
          </label>

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={updateSchedule.isPending}>
              {updateSchedule.isPending ? t("saving") : t("saveCta")}
            </Button>
            {updateSchedule.isSuccess && !updateSchedule.isPending ? (
              <span className="text-xs text-success-700">{t("saveSuccess")}</span>
            ) : null}
          </div>
          {updateSchedule.isError ? (
            <p className="text-xs text-danger-600">{t("saveError")}</p>
          ) : null}
        </form>

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
