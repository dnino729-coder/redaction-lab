"use client";
// PlanConfiguration — bloque 5 "Configuración del plan"
// (docs/modules/mi-plan.md, Vacío 1). StudySchedule (días/semana,
// sesiones/día, minutos/sesión, recordatorio) + punto de entrada a la
// reprogramación (Vacío 2 — flujo de propuesta/confirmación, fuera de
// alcance de esta fase: sin Learning Planner implementado todavía, el CTA
// queda deshabilitado con una nota explícita, en vez de simular un flujo
// que no existe).
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import type { StudyScheduleBlock } from "../types";

export interface PlanConfigurationProps {
  configuration: StudyScheduleBlock;
}

export function PlanConfiguration({ configuration }: PlanConfigurationProps) {
  const t = useTranslations("myPlan.configuration");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-neutral-500">{t("daysPerWeek")}</dt>
            <dd className="text-sm font-medium text-neutral-800">{configuration.daysPerWeek}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">{t("sessionsPerDay")}</dt>
            <dd className="text-sm font-medium text-neutral-800">{configuration.sessionsPerDay}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">{t("minutesPerSession")}</dt>
            <dd className="text-sm font-medium text-neutral-800">{configuration.minutesPerSession}</dd>
          </div>
        </dl>

        {configuration.reminderTime ? (
          <p className="text-sm text-neutral-600">{t("reminder", { time: configuration.reminderTime })}</p>
        ) : null}

        {configuration.preferences.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {configuration.preferences.map((preference) => (
              <Badge key={preference} variant="neutral">
                {preference}
              </Badge>
            ))}
          </div>
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
