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
// Cuando no hay plan activo (404), en vez del MyPlanEmptyState pasivo se
// muestra el onboarding real (StudentOnboardingForm, features/profile/) —
// único punto de composición cross-feature de este slice: Profile no
// importa nada de My Plan, solo expone `onSuccess` como prop genérica;
// aquí es donde se invalidan las queries propias de My Plan al terminar.
import { useTranslations, useFormatter } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { ApiError } from "@/lib/apiClient";
import { StudentOnboardingForm } from "@/features/profile/components";
import { useActiveLearningPlan } from "../hooks/useActiveLearningPlan";
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

  if (isLoading) return <MyPlanSkeleton />;
  if (error instanceof ApiError && error.status === 404) {
    return (
      <StudentOnboardingForm
        onSuccess={() => queryClient.invalidateQueries({ queryKey: myPlanKeys.all })}
      />
    );
  }
  if (isError || !plan) return <MyPlanErrorState onRetry={() => refetch()} />;

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
      </CardContent>
    </Card>
  );
}
