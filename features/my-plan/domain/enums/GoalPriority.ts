// ENUM de dominio — 13.4, ficha de `LearningGoal` ("priority (ENUM: LOW,
// MEDIUM, HIGH, CRITICAL)"). Independiente del ENUM `Priority` compartido
// de Prisma; mismos valores, cero dependencia hacia `@prisma/client`.
export const GoalPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type GoalPriority = (typeof GoalPriority)[keyof typeof GoalPriority];
