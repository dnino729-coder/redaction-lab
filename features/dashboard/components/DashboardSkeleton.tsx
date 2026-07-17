"use client";
// DashboardSkeleton — estado `loading` (sección 6 y 14.7: "Skeleton
// Screens"). Reproduce la silueta de los 7 bloques en el orden oficial, para
// que la carga no produzca un "salto" de layout perceptible (CLS).
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui";

export function DashboardSkeleton() {
  const t = useTranslations("dashboard.skeleton");

  return (
    <div className="flex flex-col gap-6" role="status" aria-label={t("loading")}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>

      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-lg" />
        ))}
      </div>

      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}
