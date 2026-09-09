"use client";
// PhasesAndTasks — bloque 4 "Fases y tareas" (docs/modules/mi-plan.md,
// Vacío 1). Se autoalimenta desde GetLearningPhasesHandler vía
// useLearningPhases() (mismo patrón que GoalsAndObjectives.tsx) — ya no
// recibe `phases` como prop/mock. Muestra LearningPhase reales, en orden
// de `phaseOrder` (ordenadas server-side), con sus LearningTask.
//
// Historial de StudySession (slice "connect study session history"): el
// conteo de sesiones por tarea vuelve a mostrarse, ahora con datos reales
// — `task.sessions` viene embebido en la misma respuesta de
// GetLearningPhasesHandler (StudySessionRepository.findByLearningTaskId),
// no de un endpoint aparte. Deliberadamente solo un conteo (mismo nivel de
// detalle que la versión mock anterior) — sin fechas/duración individuales,
// sin botón de iniciar/finalizar sesión, sin timer: eso es explícitamente
// otro slice.
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { ApiError } from "@/lib/apiClient";
import type { LearningPhaseStatusHttp, LearningTaskStatusHttp } from "../services/myPlanApi";
import { useLearningPhases } from "../hooks/useLearningPhases";
import { MyPlanSkeleton } from "./MyPlanSkeleton";
import { MyPlanErrorState } from "./MyPlanErrorState";
import { MyPlanEmptyState } from "./MyPlanEmptyState";

function statusVariant(
  status: LearningPhaseStatusHttp | LearningTaskStatusHttp,
): "success" | "primary" | "neutral" | "danger" {
  if (status === "COMPLETED") return "success";
  if (status === "IN_PROGRESS") return "primary";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

export function PhasesAndTasks() {
  const t = useTranslations("myPlan.phases");
  const { data: phasesData, isLoading, isError, error, refetch } = useLearningPhases();

  if (isLoading) return <MyPlanSkeleton />;
  if (error instanceof ApiError && error.status === 404) return <MyPlanEmptyState />;
  if (isError || !phasesData) return <MyPlanErrorState onRetry={() => refetch()} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {phasesData.phases.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("empty")}</p>
        ) : (
          phasesData.phases.map((phase) => (
            <div
              key={phase.id}
              className="flex flex-col gap-3 border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-neutral-800">{phase.name}</h3>
                <Badge variant={statusVariant(phase.status)}>{t(`status.${phase.status}`)}</Badge>
              </div>
              <ul className="flex flex-col gap-2 pl-3">
                {phase.tasks.map((task) => (
                  <li key={task.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-neutral-700">{task.title}</span>
                      <span className="flex items-center gap-2">
                        <Badge variant="neutral">{t(`source.${task.source}`)}</Badge>
                        <Badge variant={statusVariant(task.status)}>
                          {t(`status.${task.status}`)}
                        </Badge>
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
