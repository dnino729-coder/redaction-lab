"use client";
// PlanSummaryOverview — bloque 1 "Resumen general" (docs/modules/mi-plan.md,
// Vacío 1). Ya no recibe `summary` por props: se autoalimenta desde
// GetActiveLearningPlanHandler vía useActiveLearningPlan() (mismo patrón
// que ModelAnalysisLibrary/WritingWorkshop en Laboratory). Muestra el
// plan activo real (nombre, nivel objetivo, estado, fecha de inicio) —
// cuenta regresiva al examen / horas estudiadas / % de avance quedan
// pendientes de GetLearningProgressHandler (fuera de alcance de este
// sprint).
//
// Cuando no hay plan actual (404), en vez del MyPlanEmptyState pasivo se
// muestra el onboarding real (StudentOnboardingForm, features/profile/) —
// único punto de composición cross-feature de este slice: Profile no
// importa nada de My Plan, solo expone `onSuccess` como prop genérica;
// aquí es donde se invalidan las queries propias de My Plan al terminar.
// Desde el slice "resolve current learning plan including paused state",
// este 404 solo ocurre si el estudiante nunca tuvo un plan (o su único
// plan es terminal) — un plan PAUSED ya se resuelve y renderiza aquí.
//
// Acciones del ciclo de vida del plan (slice "expose learning plan
// lifecycle actions"): Pausar/Reanudar/Cancelar reutilizan
// PauseLearningPlanHandler/ResumeLearningPlanHandler/CancelLearningPlanHandler
// (sin modificar — ver auditoría "Pause / Resume / Cancel — Post-Current-
// Plan-Fix Readiness Audit"). Visibilidad derivada directamente de
// `plan.status` (nunca duplicada en otro sitio): ACTIVE → Pausar+Cancelar;
// PAUSED → Reanudar+Cancelar; COMPLETED/CANCELLED (terminales) → ninguna.
// Cancelar es irreversible en el dominio (sin transición de vuelta) — el
// botón solo abre un Dialog de confirmación (mismo patrón que
// features/academy/components/model-library/AdminModelLibraryContainer.tsx,
// confirmación de "retirar"); solo el botón de confirmación dentro del
// Dialog invoca la mutación. Ninguna de las tres mutaciones envía
// `planId`/`studentId`/fechas — el servidor los resuelve (ver
// learningPlanHandlers.ts). Cada una invalida únicamente
// `myPlanKeys.activeLearningPlan()` — no cambian fases/tareas/progreso/
// horario/metas (ver auditoría, sección 11).
import { useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Dialog } from "@/components/ui";
import { ApiError } from "@/lib/apiClient";
import { StudentOnboardingForm } from "@/features/profile/components";
import { useActiveLearningPlan } from "../hooks/useActiveLearningPlan";
import { usePauseLearningPlan } from "../hooks/usePauseLearningPlan";
import { useResumeLearningPlan } from "../hooks/useResumeLearningPlan";
import { useCancelLearningPlan } from "../hooks/useCancelLearningPlan";
import { myPlanKeys } from "../constants";
import { MyPlanSkeleton } from "./MyPlanSkeleton";
import { MyPlanErrorState } from "./MyPlanErrorState";

function statusVariant(status: string): "success" | "primary" | "neutral" {
  if (status === "COMPLETED") return "success";
  if (status === "ACTIVE") return "primary";
  return "neutral";
}

export function PlanSummaryOverview() {
  const t = useTranslations("myPlan.summary");
  const format = useFormatter();
  const queryClient = useQueryClient();
  const { data: plan, isLoading, isError, error, refetch } = useActiveLearningPlan();
  const pauseLearningPlan = usePauseLearningPlan();
  const resumeLearningPlan = useResumeLearningPlan();
  const cancelLearningPlan = useCancelLearningPlan();
  const [pendingCancel, setPendingCancel] = useState(false);

  if (isLoading) return <MyPlanSkeleton />;
  if (error instanceof ApiError && error.status === 404) {
    return (
      <StudentOnboardingForm
        onSuccess={() => queryClient.invalidateQueries({ queryKey: myPlanKeys.all })}
      />
    );
  }
  if (isError || !plan) return <MyPlanErrorState onRetry={() => refetch()} />;

  const canPause = plan.status === "ACTIVE";
  const canResume = plan.status === "PAUSED";
  const canCancel = plan.status === "ACTIVE" || plan.status === "PAUSED";

  function handleConfirmCancel() {
    cancelLearningPlan.mutate(undefined, { onSuccess: () => setPendingCancel(false) });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-base font-medium text-neutral-900">{plan.name}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{t("targetLevel", { level: plan.targetLevel })}</Badge>
          <Badge variant={statusVariant(plan.status)}>{t(`status.${plan.status}`)}</Badge>
        </div>

        <p className="text-sm text-neutral-600">
          {t("startDate", {
            date: format.dateTime(new Date(plan.startDate), { dateStyle: "long" }),
          })}
        </p>

        {canPause || canResume || canCancel ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-4">
            {canPause ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pauseLearningPlan.isPending}
                onClick={() => pauseLearningPlan.mutate()}
              >
                {pauseLearningPlan.isPending ? t("pausing") : t("pauseCta")}
              </Button>
            ) : null}
            {canResume ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={resumeLearningPlan.isPending}
                onClick={() => resumeLearningPlan.mutate()}
              >
                {resumeLearningPlan.isPending ? t("resuming") : t("resumeCta")}
              </Button>
            ) : null}
            {canCancel ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPendingCancel(true)}
              >
                {t("cancelCta")}
              </Button>
            ) : null}
          </div>
        ) : null}

        {pauseLearningPlan.isError || resumeLearningPlan.isError ? (
          <p className="text-xs text-danger-600">{t("actionError")}</p>
        ) : null}
      </CardContent>

      <Dialog
        open={pendingCancel}
        onClose={() => setPendingCancel(false)}
        title={t("cancelConfirmTitle")}
      >
        <p className="text-sm text-neutral-700">{t("cancelConfirmMessage")}</p>
        {cancelLearningPlan.isError ? (
          <p role="alert" className="text-sm text-danger-600">
            {t("actionError")}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setPendingCancel(false)}>
            {t("keepPlanCta")}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirmCancel}
            disabled={cancelLearningPlan.isPending}
            aria-busy={cancelLearningPlan.isPending}
          >
            {t("confirmCancelCta")}
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}
