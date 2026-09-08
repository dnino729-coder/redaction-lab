"use client";
// MyPlanView — ensambla los 5 bloques de Mi Plan (docs/modules/mi-plan.md,
// Vacío 1) en el orden exacto especificado. Bloque 1 (PlanSummaryOverview)
// ya es real: se autoalimenta vía useActiveLearningPlan(), sin recibir
// props de este componente. Los bloques 2-5 siguen recibiendo los datos ya
// cargados desde el mock (mismo patrón de composición que DashboardView),
// mientras no tengan backend propio.
import {
  PlanSummaryOverview,
  TrainingCalendar,
  GoalsAndObjectives,
  PhasesAndTasks,
  PlanConfiguration,
} from "../components";
import type { MyPlanReadModel } from "../types";

export interface MyPlanViewProps {
  data: MyPlanReadModel;
}

export function MyPlanView({ data }: MyPlanViewProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Bloque 1 — Resumen general (datos reales) */}
      <PlanSummaryOverview />
      {/* Bloque 2 — Calendario de entrenamiento */}
      <TrainingCalendar calendar={data.calendar} />
      {/* Bloque 3 — Objetivos y metas */}
      <GoalsAndObjectives goals={data.goals} />
      {/* Bloque 4 — Fases y tareas */}
      <PhasesAndTasks phases={data.phases} />
      {/* Bloque 5 — Configuración del plan */}
      <PlanConfiguration configuration={data.configuration} />
    </div>
  );
}
