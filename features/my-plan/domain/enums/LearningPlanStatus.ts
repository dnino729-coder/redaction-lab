// ENUM de dominio — 13.4, ficha de `LearningPlan`. Independiente del ENUM
// `LearningPlanStatus` generado por Prisma (prisma/schema.prisma); mismos
// valores, cero dependencia hacia `@prisma/client`.
export const LearningPlanStatus = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type LearningPlanStatus =
  (typeof LearningPlanStatus)[keyof typeof LearningPlanStatus];
