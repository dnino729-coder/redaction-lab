"use client";
// MyPlanSkeleton — silueta de los 5 bloques, mismo primitivo Skeleton de
// components/ui que ya usa Dashboard (DashboardSkeleton), reutilizado tal
// cual — solo la composición/forma es propia de Mi Plan. Desacoplado por
// ahora: sin flujo asíncrono real todavía (ver MyPlanErrorState).
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui";

export function MyPlanSkeleton() {
  const t = useTranslations("myPlan.skeleton");

  return (
    <div className="flex flex-col gap-6" role="status" aria-label={t("loading")}>
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-28 rounded-lg" />
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}
