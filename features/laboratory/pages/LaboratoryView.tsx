"use client";
// LaboratoryView — ensambla los bloques de Laboratorio con backend real.
// Los bloques 1 (Résumé), 4 (Correction), 5 (Révision) y 6 (Autoévaluation)
// aún no tienen datos reales — se ocultan de la página real por ahora
// (no se muestran datos simulados a usuarios reales) hasta que se
// implementen. No se elimina su código: LabSummaryOverview,
// FeedbackReviewPanel, GrammarLexicalRevision y SelfAssessmentPanel siguen
// disponibles en ../components para cuando tengan backend propio.
import { ModelAnalysisLibrary, WritingWorkshop } from "../components";

export function LaboratoryView() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Bloque 2 — Analyse d'un modèle (datos reales) */}
      <ModelAnalysisLibrary />
      {/* Bloque 3 — Atelier d'écriture (datos reales) */}
      <WritingWorkshop />
    </div>
  );
}
