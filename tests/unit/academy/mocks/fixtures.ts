// Fixtures canónicas de Academia — un objeto representativo por DTO de la
// Sección 5 del Blueprint (docs/audits/academia-frontend-implementation-
// blueprint-v1.0-2026-07-28.md). Scaffolding de tests (Fase 0.8): solo la
// forma base de cada tipo, reutilizable por los tests de Fase 1 — no
// pretende cubrir todas las variantes de estado.
import type {
  AcademyUnitDetailHttp,
  AcademyUnitSummaryHttp,
  AttemptSummaryHttp,
  ContinuationStateHttp,
  DraftHttp,
  FeedbackHttp,
  ModelExampleHttp,
  StudentProgressSummaryHttp,
  StudentUnitHistoryHttp,
  TeacherOverrideHttp,
  TeacherRecommendationHttp,
  VersionHttp,
} from "@/features/academy/types";

export const unitSummaryFixture: AcademyUnitSummaryHttp = {
  unitId: "unit-1",
  studentId: "student-1",
  textType: "ESSAY",
  position: 1,
  state: "UNLOCKED",
  activeAttemptId: null,
};

export const unitDetailFixture: AcademyUnitDetailHttp = {
  ...unitSummaryFixture,
  completedAt: null,
  masteredAt: null,
  eligibleForUnlock: false,
  repeatable: false,
  teacherOverrideCount: 0,
};

export const attemptSummaryFixture: AttemptSummaryHttp = {
  attemptId: "attempt-1",
  unitId: unitSummaryFixture.unitId,
  currentStep: "CONTEXTUALIZE",
  startedAt: "2026-07-01T00:00:00.000Z",
  isCurrent: true,
};

export const draftFixture: DraftHttp = {
  attemptId: attemptSummaryFixture.attemptId,
  content: "Borrador de ejemplo.",
  wordCount: 3,
  characterCount: 20,
  lastSavedAt: "2026-07-01T00:05:00.000Z",
};

export const versionFixture: VersionHttp = {
  versionId: "version-1",
  attemptId: attemptSummaryFixture.attemptId,
  versionNumber: 1,
  content: "Versión de ejemplo.",
  submittedAt: "2026-07-01T00:10:00.000Z",
  feedbackStatus: "PROCESSING",
};

export const feedbackFixture: FeedbackHttp = {
  feedbackId: "feedback-1",
  versionId: versionFixture.versionId,
  versionNumber: versionFixture.versionNumber,
  status: "READY",
  observations: [
    {
      category: "COHERENCE",
      strength: "WEAKNESS",
      explanation: "Ejemplo de explicación.",
      suggestion: "Ejemplo de sugerencia.",
    },
  ],
  deliveredAt: "2026-07-01T00:15:00.000Z",
};

export const modelExampleFixture: ModelExampleHttp = {
  modelExampleId: "model-example-1",
  textType: "ESSAY",
  content: "Contenido de ejemplo modelo.",
  rating: "EXCELLENT",
  curatorialComment: "Comentario curatorial de ejemplo.",
  status: "ACTIVE",
};

export const teacherOverrideFixture: TeacherOverrideHttp = {
  overrideId: "override-1",
  unitId: unitSummaryFixture.unitId,
  action: "FORCE_RESTART",
  reason: "Motivo de ejemplo.",
  appliedBy: "teacher-1",
  appliedAt: "2026-07-01T00:20:00.000Z",
};

export const teacherRecommendationFixture: TeacherRecommendationHttp = {
  recommendationId: "recommendation-1",
  studentId: unitSummaryFixture.studentId,
  unitId: unitSummaryFixture.unitId,
  recommendedBy: "teacher-1",
  recommendedAt: "2026-07-01T00:25:00.000Z",
};

export const progressSummaryFixture: StudentProgressSummaryHttp = {
  studentId: unitSummaryFixture.studentId,
  unitsByState: { UNLOCKED: 1, IN_PROGRESS: 1 },
  unitsByTextType: { ESSAY: 2 },
};

export const continuationFixture: ContinuationStateHttp = {
  unit: unitDetailFixture,
  attempt: attemptSummaryFixture,
  draft: { content: draftFixture.content, lastSavedAt: draftFixture.lastSavedAt },
};

export const studentUnitHistoryFixture: StudentUnitHistoryHttp = {
  studentId: unitSummaryFixture.studentId,
  unitId: unitSummaryFixture.unitId,
  unitState: "IN_PROGRESS",
  attemptsCount: 1,
  attempts: [{ ...attemptSummaryFixture, versions: [{ version: versionFixture, feedback: feedbackFixture }] }],
};
