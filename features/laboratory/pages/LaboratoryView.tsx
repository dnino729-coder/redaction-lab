"use client";
// LaboratoryView — ensambla los 6 bloques de Laboratorio en el orden
// aprobado. Mismo patrón de composición que MyPlanView/DashboardView.
import {
  LabSummaryOverview,
  ModelAnalysisLibrary,
  WritingWorkshop,
  FeedbackReviewPanel,
  GrammarLexicalRevision,
  SelfAssessmentPanel,
} from "../components";
import type { LaboratoryReadModel } from "../types";

export interface LaboratoryViewProps {
  data: LaboratoryReadModel;
}

export function LaboratoryView({ data }: LaboratoryViewProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Bloque 1 — Résumé du laboratoire */}
      <LabSummaryOverview summary={data.summary} />
      {/* Bloque 2 — Analyse d'un modèle (datos reales, ver ModelAnalysisLibrary) */}
      <ModelAnalysisLibrary />
      {/* Bloque 3 — Atelier d'écriture (datos reales, ver WritingWorkshop) */}
      <WritingWorkshop />
      {/* Bloque 4 — Correction et rétroaction */}
      <FeedbackReviewPanel feedback={data.feedback} />
      {/* Bloque 5 — Révision grammaticale et lexicale */}
      <GrammarLexicalRevision revision={data.revision} />
      {/* Bloque 6 — Autoévaluation */}
      <SelfAssessmentPanel selfAssessment={data.selfAssessment} />
    </div>
  );
}
