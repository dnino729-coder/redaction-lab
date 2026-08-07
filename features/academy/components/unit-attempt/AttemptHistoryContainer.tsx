// AttemptHistoryContainer — Blueprint §12 (P-03). El Blueprint no nombra un
// Container propio para esta pantalla (§10.1/§21 solo listan `AttemptHistoryList`
// como componente consumidor de `useUnitAttempts`), pero la arquitectura
// Container/Presentational de esta fase exige que la lógica de datos viva en
// un único componente inteligente — se añade este Container, delgado, para
// mantener esa separación sin alterar el comportamiento ni los componentes
// presentacionales ya nombrados por el Blueprint.
//
// `useUnitDetail(unitId)` (Fase 0) se reutiliza aquí únicamente para obtener
// `position` y así construir el breadcrumb "Academia / {Unidad} / Historial"
// (§19) — el Blueprint no lo lista entre los hooks de P-03 (solo
// `useUnitAttempts`), pero sin él no hay forma de mostrar "{Unidad}" sin
// inventar un dato. Es "best-effort": no bloquea ni condiciona los estados
// Loading/Error/Empty de la pantalla (esos dependen únicamente de EP-16); si
// aún no resolvió, el breadcrumb se muestra sin el segundo segmento.
"use client";

import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { EmptyState, ErrorState, ForbiddenState, Skeleton } from "@/components/ui";
import { ApiError } from "@/lib/apiClient";
import { useUnitAttempts, useUnitDetail } from "../../hooks";
import { academyRoutes } from "../../constants";
import { AcademyBreadcrumbs } from "../shared";
import { AttemptHistoryList } from "./AttemptHistoryList";

export interface AttemptHistoryContainerProps {
  unitId: string;
}

export function AttemptHistoryContainer({ unitId }: AttemptHistoryContainerProps) {
  const t = useTranslations("academy.unitHistory");
  const tUnitDetail = useTranslations("academy.unitDetail");
  const tUnitMap = useTranslations("academy.unitMap");
  const tLayout = useTranslations("academy.layout");

  const attemptsQuery = useUnitAttempts(unitId);
  const unitDetailQuery = useUnitDetail(unitId);

  if (attemptsQuery.isLoading) {
    return <AttemptHistoryLoadingSkeleton />;
  }

  if (attemptsQuery.isError) {
    const error = attemptsQuery.error;

    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    // "Forbidden: igual que P-02" (Blueprint §12) — mismo mensaje, sin
    // duplicar la clave de i18n.
    if (error instanceof ApiError && error.status === 403) {
      return <ForbiddenState title={tUnitDetail("forbiddenTitle")} />;
    }

    return (
      <ErrorState
        title={t("errorTitle")}
        description={error.message}
        retryLabel={tUnitMap("retryLabel")}
        onRetry={() => attemptsQuery.refetch()}
      />
    );
  }

  const attempts = attemptsQuery.data?.data ?? [];
  const unitLabel = unitDetailQuery.data
    ? tUnitMap("unitLabel", { position: unitDetailQuery.data.position })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <AcademyBreadcrumbs
        items={[
          { label: tLayout("title"), href: academyRoutes.unitMap() },
          ...(unitLabel ? [{ label: unitLabel, href: academyRoutes.unitDetail(unitId) }] : []),
          { label: t("breadcrumbCurrent") },
        ]}
      />

      {/* Fix AFR018-02 (AFR-018): heading propio de la pantalla, ausente
          hasta ahora — misma jerarquía (<h1>, mismas clases) que
          `UnitDetailContainer` (P-02). */}
      <h1 className="text-xl font-semibold text-neutral-900">{t("breadcrumbCurrent")}</h1>

      {attempts.length === 0 ? <EmptyState title={t("emptyTitle")} /> : <AttemptHistoryList attempts={attempts} />}
    </div>
  );
}

function AttemptHistoryLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-4 w-40" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
