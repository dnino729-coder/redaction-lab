"use client";
// PhasesAndTasks — bloque 4 "Fases y tareas" (docs/modules/mi-plan.md,
// Vacío 1). LearningPhase en orden temporal, con sus LearningTask y, dentro
// de cada tarea, su historial de StudySession.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { LearningGoalStatus, PhasesBlock } from "../types";

export interface PhasesAndTasksProps {
  phases: PhasesBlock;
}

function statusVariant(status: LearningGoalStatus): "success" | "primary" | "neutral" | "danger" {
  if (status === "COMPLETED") return "success";
  if (status === "IN_PROGRESS") return "primary";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

export function PhasesAndTasks({ phases }: PhasesAndTasksProps) {
  const t = useTranslations("myPlan.phases");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {phases.phases.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          phases.phases.map((phase) => (
            <div key={phase.id} className="flex flex-col gap-3 border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-neutral-800">{phase.title}</h3>
                <Badge variant={statusVariant(phase.status)}>{t(`status.${phase.status}`)}</Badge>
              </div>
              <ul className="flex flex-col gap-2 pl-3">
                {phase.tasks.map((task) => (
                  <li key={task.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-neutral-700">{task.title}</span>
                      <span className="flex items-center gap-2">
                        <Badge variant="neutral">{t(`source.${task.source}`)}</Badge>
                        <Badge variant={statusVariant(task.status)}>{t(`status.${task.status}`)}</Badge>
                      </span>
                    </div>
                    {task.sessions.length > 0 ? (
                      <p className="text-xs text-neutral-500">
                        {t("sessions", { count: task.sessions.length })}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
