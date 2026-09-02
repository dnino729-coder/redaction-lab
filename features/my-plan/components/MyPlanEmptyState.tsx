"use client";
// MyPlanEmptyState — estado "sin plan activo" (docs/modules/mi-plan.md,
// Vacío 4: "estado defensivo de la interfaz, nunca como flujo de producto"
// — un LearningPlan siempre debería existir por creación automática; esto
// solo cubre el caso excepcional). Envoltorio delgado sobre el EmptyState
// genérico de components/ui — no reinventa el layout, solo añade el texto
// vía next-intl.
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui";

export function MyPlanEmptyState() {
  const t = useTranslations("myPlan.empty");

  return <EmptyState title={t("title")} description={t("description")} />;
}
