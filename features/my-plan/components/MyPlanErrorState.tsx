"use client";
// MyPlanErrorState — envoltorio delgado sobre el ErrorState genérico de
// components/ui (mismo principio que MyPlanEmptyState: no reinventa el
// layout). Deliberadamente desacoplado por ahora: no existe todavía un
// flujo asíncrono de datos reales en Mi Plan (sin hook equivalente a
// useDashboardData) al que conectarlo — listo para cuando exista.
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/ui";

export interface MyPlanErrorStateProps {
  onRetry?: () => void;
}

export function MyPlanErrorState({ onRetry }: MyPlanErrorStateProps) {
  const t = useTranslations("myPlan.error");

  return <ErrorState title={t("title")} description={t("description")} onRetry={onRetry} retryLabel={t("retry")} />;
}
