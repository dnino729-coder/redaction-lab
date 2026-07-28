// Enum de dominio (Domain Model v1.1, Sección 6) — alineado a
// §13.5/`WritingTask`, distinto y no confundible con la escala de
// `LearningTask.difficulty` de Mi Plan (que incluye `EXPERT` y pertenece
// a otro Bounded Context).
export const DifficultyLevel = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;

export type DifficultyLevel = (typeof DifficultyLevel)[keyof typeof DifficultyLevel];
