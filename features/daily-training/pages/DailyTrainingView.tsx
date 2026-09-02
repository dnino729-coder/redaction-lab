"use client";
// DailyTrainingView — ensambla los 6 bloques de Entrenamiento en el orden
// aprobado. Mismo patrón de composición que LaboratoryView/MyPlanView.
import {
  TrainingSummaryOverview,
  DailyChallengeCard,
  QuickDrillList,
  ChallengeHistoryCalendar,
  TrainingFocusBreakdown,
  TrainingGoalsConfig,
} from "../components";
import type { DailyTrainingReadModel } from "../types";

export interface DailyTrainingViewProps {
  data: DailyTrainingReadModel;
}

export function DailyTrainingView({ data }: DailyTrainingViewProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Bloque 1 — Résumé de l'entraînement */}
      <TrainingSummaryOverview summary={data.summary} />
      {/* Bloque 2 — Défi du jour */}
      <DailyChallengeCard dailyChallenge={data.dailyChallenge} />
      {/* Bloque 3 — Exercices rapides */}
      <QuickDrillList quickDrills={data.quickDrills} />
      {/* Bloque 4 — Historique des défis */}
      <ChallengeHistoryCalendar history={data.history} />
      {/* Bloque 5 — Progression par compétence */}
      <TrainingFocusBreakdown focus={data.focus} />
      {/* Bloque 6 — Objectifs d'entraînement */}
      <TrainingGoalsConfig goals={data.goals} />
    </div>
  );
}
