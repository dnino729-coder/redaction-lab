"use client";
// PhasesAndTasks — bloque 4 "Fases y tareas" (docs/modules/mi-plan.md,
// Vacío 1). Se autoalimenta desde GetLearningPhasesHandler vía
// useLearningPhases() (mismo patrón que GoalsAndObjectives.tsx) — ya no
// recibe `phases` como prop/mock. Muestra LearningPhase reales, en orden
// de `phaseOrder` (ordenadas server-side), con sus LearningTask.
//
// Historial de StudySession (slice "connect study session history"): el
// conteo de sesiones por tarea se muestra con datos reales — `task.sessions`
// viene embebido en la misma respuesta de GetLearningPhasesHandler
// (StudySessionRepository.findByLearningTaskId), no de un endpoint aparte.
//
// Iniciar/finalizar sesión (slice "create and finish study sessions"):
// un botón "Iniciar sesión" por tarea (siempre disponible — el dominio
// permite múltiples sesiones simultáneas por tarea, no se deshabilita por
// tener ya una abierta) y un botón "Finalizar" por cada sesión con
// `completed = false`. Tras cualquiera de las dos mutaciones se invalida
// `myPlanKeys.phases()` — la UI se refresca con datos reales, sin caché
// paralela. Deliberadamente sin timer/cronómetro/tiempo transcurrido en
// vivo: `finishedAt`/`durationMinutes` los calcula el servidor (Clock),
// nunca se muestran mientras la sesión está abierta.
//
// Completar tarea (slice "complete learning tasks"): un botón "Completar
// tarea" solo para tareas `source = SELF_DIRECTED` con `status`
// NOT_STARTED/IN_PROGRESS (mismo campo `source` ya expuesto por
// `LearningTaskSummaryHttp` — no se inventa ningún dato nuevo). No se
// muestra para tareas ya COMPLETED/CANCELLED ni para fuentes externas —
// CompleteLearningTaskHandler (sin modificar) las rechazaría con 409.
// Reutiliza exactamente ese Handler; no completa la tarea automáticamente
// al finalizar una sesión — son acciones independientes. Tras el éxito se
// invalidan `myPlanKeys.phases()` Y `myPlanKeys.progress()` (completar una
// tarea recalcula LearningPhase.status y LearningProgress en el mismo
// Handler).
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { ApiError } from "@/lib/apiClient";
import type { LearningPhaseStatusHttp, LearningTaskStatusHttp } from "../services/myPlanApi";
import { useLearningPhases } from "../hooks/useLearningPhases";
import { useCreateStudySession } from "../hooks/useCreateStudySession";
import { useFinishStudySession } from "../hooks/useFinishStudySession";
import { useCompleteLearningTask } from "../hooks/useCompleteLearningTask";
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
  const createSession = useCreateStudySession();
  const finishSession = useFinishStudySession();
  const completeTask = useCompleteLearningTask();

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
                {phase.tasks.map((task) => {
                  const isStartingThisTask =
                    createSession.isPending && createSession.variables === task.id;
                  const startFailedForThisTask =
                    createSession.isError && createSession.variables === task.id;
                  const openSessions = task.sessions.filter((session) => !session.completed);
                  const finishFailedForThisTask =
                    finishSession.isError &&
                    openSessions.some((session) => session.id === finishSession.variables);
                  const canCompleteTask =
                    task.source === "SELF_DIRECTED" &&
                    (task.status === "NOT_STARTED" || task.status === "IN_PROGRESS");
                  const isCompletingThisTask =
                    completeTask.isPending && completeTask.variables === task.id;
                  const completeFailedForThisTask =
                    completeTask.isError && completeTask.variables === task.id;

                  return (
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
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isStartingThisTask}
                          onClick={() => createSession.mutate(task.id)}
                        >
                          {isStartingThisTask ? t("startingSession") : t("startSession")}
                        </Button>
                        {openSessions.map((session) => {
                          const isFinishingThisSession =
                            finishSession.isPending && finishSession.variables === session.id;
                          return (
                            <Button
                              key={session.id}
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isFinishingThisSession}
                              onClick={() => finishSession.mutate(session.id)}
                            >
                              {isFinishingThisSession ? t("finishingSession") : t("finishSession")}
                            </Button>
                          );
                        })}
                        {canCompleteTask ? (
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={isCompletingThisTask}
                            onClick={() => completeTask.mutate(task.id)}
                          >
                            {isCompletingThisTask ? t("completingTask") : t("completeTask")}
                          </Button>
                        ) : null}
                      </div>
                      {startFailedForThisTask || finishFailedForThisTask ? (
                        <p className="text-xs text-danger-600">{t("sessionActionError")}</p>
                      ) : null}
                      {completeFailedForThisTask ? (
                        <p className="text-xs text-danger-600">{t("completeTaskError")}</p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
