// UnitMapContainer — Blueprint §10.1/§12 (P-01). Único componente
// inteligente de esta pantalla: concentra hooks de datos, navegación,
// estado derivado (filtro/agrupación), y manejo de errores/loading. Los
// componentes presentacionales (`UnitCard`, `TextTypeSectionHeader`) no
// invocan React Query ni Server Actions.
//
// Aclaración (discrepancia menor dentro del propio Blueprint, resuelta a
// favor del texto más específico): §10.1 lista "Offline, Retry" entre los
// estados de este Container, pero la especificación detallada de P-01 (§12)
// solo enumera Loading/Empty/Success/Error/Unauthorized/Forbidden/Not Found
// — y el propio §12 de P-08 describe su estado Offline como "única pantalla
// con este estado explícito". Se implementa aquí exactamente lo que la
// sección detallada de P-01 especifica; "Retry" es la acción del estado
// Error (`onRetry`), no un estado adicional.
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { EmptyState, ErrorState, Select, Skeleton } from "@/components/ui";
import { useAcademyRole, useContinuation, useUnits } from "../../hooks";
import { academyRoutes, ALL_TEXT_TYPES } from "../../constants";
import { UnitCard } from "./UnitCard";
import { TextTypeSectionHeader } from "./TextTypeSectionHeader";
import type { AcademyUnitSummaryHttp, TextType } from "../../types";

export interface UnitMapContainerProps {
  initialTextTypeFilter?: TextType;
}

export function UnitMapContainer({ initialTextTypeFilter }: UnitMapContainerProps) {
  const t = useTranslations("academy.unitMap");
  const tTextType = useTranslations("academy.textType");
  const router = useRouter();
  const pathname = usePathname();

  const [textType, setTextType] = useState<TextType | undefined>(initialTextTypeFilter);

  const { role, isLoaded: isRoleLoaded } = useAcademyRole();
  const unitsQuery = useUnits(textType);
  const continuationQuery = useContinuation();

  useEffect(() => {
    if (!isRoleLoaded) return;
    if (role === "TEACHER") {
      router.replace(academyRoutes.teacherPanel());
    } else if (role === "ADMIN") {
      router.replace(academyRoutes.adminModelLibrary());
    }
  }, [isRoleLoaded, role, router]);

  function handleFilterChange(next: TextType | undefined) {
    setTextType(next);
    const params = new URLSearchParams();
    if (next) params.set("textType", next);
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleSelectUnit(unitId: string) {
    router.push(academyRoutes.unitDetail(unitId));
  }

  // Blueprint §12 (P-01): "useAcademyRole() debe resolver antes de decidir
  // renderizar o redirigir" — mientras no resuelve, o mientras el redirect de
  // TEACHER/ADMIN está en vuelo, se muestra el mismo skeleton que Loading.
  if (!isRoleLoaded || role === "TEACHER" || role === "ADMIN" || unitsQuery.isLoading) {
    return <UnitMapLoadingSkeleton />;
  }

  if (unitsQuery.isError) {
    return (
      <ErrorState
        title={t("errorTitle")}
        description={unitsQuery.error.message}
        retryLabel={t("retryLabel")}
        onRetry={() => unitsQuery.refetch()}
      />
    );
  }

  const units = unitsQuery.data?.data ?? [];

  if (units.length === 0) {
    return <EmptyState title={t("emptyTitle")} />;
  }

  const continuation = continuationQuery.data ?? null;
  const grouped = groupByTextType(units);

  return (
    <div className="flex flex-col gap-6">
      {continuation && continuation.attempt.currentStep !== "UNLOCK" ? (
        <Link
          href={academyRoutes.attemptStep(continuation.attempt.attemptId, continuation.attempt.currentStep)}
          className="rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm font-medium text-primary-700 hover:bg-primary-100"
        >
          {t("continueBanner")}
        </Link>
      ) : null}

      <div className="flex items-center justify-end">
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          {t("filterLabel")}
          <Select
            value={textType ?? ""}
            onChange={(event) => handleFilterChange((event.target.value || undefined) as TextType | undefined)}
          >
            <option value="">{t("filterAll")}</option>
            {ALL_TEXT_TYPES.map((candidate) => (
              <option key={candidate} value={candidate}>
                {tTextType(candidate)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {Array.from(grouped.entries()).map(([sectionTextType, sectionUnits]) => (
        <section key={sectionTextType} className="flex flex-col gap-3">
          <TextTypeSectionHeader textType={sectionTextType} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sectionUnits.map((unit) => (
              // isRecommended siempre `false`: `AcademyUnitSummaryHttp` no
              // tiene ese campo (gap disclosed, Blueprint §5.1) — nunca se
              // simula un dato que el backend no entrega.
              <UnitCard key={unit.unitId} unit={unit} isRecommended={false} onSelect={handleSelectUnit} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupByTextType(units: readonly AcademyUnitSummaryHttp[]): Map<TextType, AcademyUnitSummaryHttp[]> {
  const grouped = new Map<TextType, AcademyUnitSummaryHttp[]>();
  for (const unit of units) {
    const existing = grouped.get(unit.textType);
    if (existing) existing.push(unit);
    else grouped.set(unit.textType, [unit]);
  }
  return grouped;
}

function UnitMapLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      {[0, 1].map((section) => (
        <div key={section} className="flex flex-col gap-3">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
