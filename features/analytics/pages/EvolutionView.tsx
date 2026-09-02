"use client";
// EvolutionView — ensambla los 6 bloques de Évolution en el orden aprobado.
// Dashboard analítico: los 6 bloques coexisten siempre visibles, mismo
// patrón de composición que LaboratoryView/DailyTrainingView (a diferencia
// de SimulatorView, que muestra una sola pantalla por vez).
import {
  EvolutionOverviewCard,
  CompetencyEvolutionPanel,
  ProductionHistoryList,
  ErrorFrequencyBreakdown,
  PerformanceComparisonPanel,
  PersonalizedRecommendationCard,
} from "../components";
import type { EvolutionReadModel } from "../types";

export interface EvolutionViewProps {
  data: EvolutionReadModel;
}

export function EvolutionView({ data }: EvolutionViewProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Bloque 1 — Vue d'ensemble des progrès */}
      <EvolutionOverviewCard overview={data.overview} />
      {/* Bloque 2 — Évolution des compétences */}
      <CompetencyEvolutionPanel competencies={data.competencies} />
      {/* Bloque 3 — Historique des productions */}
      <ProductionHistoryList productions={data.productions} />
      {/* Bloque 4 — Analyse des erreurs */}
      <ErrorFrequencyBreakdown errors={data.errors} />
      {/* Bloque 5 — Comparaison des performances */}
      <PerformanceComparisonPanel performance={data.performance} />
      {/* Bloque 6 — Recommandations personnalisées */}
      <PersonalizedRecommendationCard recommendations={data.recommendations} />
    </div>
  );
}
