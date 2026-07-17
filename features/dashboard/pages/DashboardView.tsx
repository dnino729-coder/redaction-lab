"use client";
// DashboardView — ensambla los 7 bloques en el orden exacto obligatorio
// (docs/modules/dashboard.md, sección 2/8.4). Layout responsive
// mobile-first (14.10): una columna en móvil; los bloques 2 y 3 pasan a 2
// columnas desde tablet; el bloque 7 usa grid 3 columnas en tablet y 4 en
// escritorio (ya resuelto dentro de EcosystemAccessGrid). Hidrata con los
// datos ya cargados por el Server Component (DashboardPage) vía
// `useDashboardData` (TanStack Query, sección 9).
import {
  WelcomeHeader,
  GoalOverviewCard,
  PlanSummaryCard,
  ContinueWhereYouLeftOff,
  CoachRecommendationCard,
  EvolutionSummaryPanel,
  EcosystemAccessGrid,
  DashboardErrorState,
} from "../components";
import { useDashboardData } from "../hooks";
import type { DashboardReadModel } from "../types";

export interface DashboardViewProps {
  initialData: DashboardReadModel;
}

export function DashboardView({ initialData }: DashboardViewProps) {
  const { data, isError, refetch } = useDashboardData(initialData);

  if (isError || !data) {
    return <DashboardErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Bloque 1 — Bienvenida */}
      <WelcomeHeader welcome={data.welcome} />

      {/* Bloques 2 y 3 — Mi objetivo / Mi Plan (2 columnas desde tablet) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <GoalOverviewCard goal={data.goal} />
        <PlanSummaryCard plan={data.plan} />
      </div>

      {/* Bloque 4 — Continúa donde te quedaste */}
      <ContinueWhereYouLeftOff continuation={data.continuation} />

      {/* Bloque 5 — Recomendación del Coach IA */}
      <CoachRecommendationCard recommendation={data.recommendation} />

      {/* Bloque 6 — Evolución */}
      <EvolutionSummaryPanel evolution={data.evolution} />

      {/* Bloque 7 — Acceso a los ecosistemas */}
      <EcosystemAccessGrid ecosystems={data.ecosystems} />
    </div>
  );
}
