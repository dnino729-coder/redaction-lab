// ENUM de dominio — 13.4, ficha de `LearningTask`.
export const LearningTaskDifficulty = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
  EXPERT: "EXPERT",
} as const;

export type LearningTaskDifficulty =
  (typeof LearningTaskDifficulty)[keyof typeof LearningTaskDifficulty];
