"use client";
// SimulatorView — a diferencia de LaboratoryView/DailyTrainingView, NO
// ensambla todos los bloques a la vez: decide qué PANTALLA mostrar según
// `data.currentStep`, reflejando que un examen es una sesión secuencial e
// irreversible, no un dashboard de tarjetas simultáneas.
import {
  SimulatorOverview,
  SubjectSelectionGrid,
  ExamPromptScreen,
  PlanningNotepad,
  WritingSessionEditor,
  SubmissionConfirmation,
  EvaluationResultPanel,
  OfficialRubricComparison,
} from "../components";
import type { SimulatorReadModel } from "../types";

export interface SimulatorViewProps {
  data: SimulatorReadModel;
}

export function SimulatorView({ data }: SimulatorViewProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {data.currentStep === "SUBJECT_SELECTION" ? (
        <>
          <SimulatorOverview overview={data.overview} />
          <SubjectSelectionGrid subjectSelection={data.subjectSelection} />
        </>
      ) : null}
      {data.currentStep === "PROMPT" ? <ExamPromptScreen prompt={data.prompt} /> : null}
      {data.currentStep === "PLANNING" ? <PlanningNotepad planning={data.planning} /> : null}
      {data.currentStep === "WRITING" ? <WritingSessionEditor writing={data.writing} /> : null}
      {data.currentStep === "SUBMISSION" ? <SubmissionConfirmation submission={data.submission} /> : null}
      {data.currentStep === "EVALUATION" ? <EvaluationResultPanel evaluation={data.evaluation} /> : null}
      {data.currentStep === "ANALYSIS" ? <OfficialRubricComparison analysis={data.analysis} /> : null}
    </div>
  );
}
