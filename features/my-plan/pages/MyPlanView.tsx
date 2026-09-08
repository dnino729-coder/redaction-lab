"use client";
// MyPlanView — ensambla los bloques de Mi Plan (docs/modules/mi-plan.md,
// Vacío 1) en el orden exacto especificado, más el bloque 6 (Progreso,
// nuevo, vertical slice #3). Bloques 1 (PlanSummaryOverview), 5
// (PlanConfiguration) y 6 (LearningProgressOverview) ya son reales: se
// autoalimentan vía useActiveLearningPlan()/useStudySchedule()/
// useLearningProgress(), sin recibir props de este componente. Los
// bloques 2-4 siguen recibiendo los datos ya cargados desde el mock
// (mismo patrón de composición que DashboardView), mientras no tengan
// backend propio.
import {
  PlanSummaryOverview,
  TrainingCalendar,
  GoalsAndObjectives,
  PhasesAndTasks,
  PlanConfiguration,
  LearningProgressOverview,
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
      {/* Bloque 5 — Configuración del plan (datos reales) */}
      <PlanConfiguration />
      {/* Bloque 6 — Progreso (datos reales) */}
      <LearningProgressOverview />
    </div>
  );
}
