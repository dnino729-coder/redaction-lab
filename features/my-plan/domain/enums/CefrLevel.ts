// ENUM de dominio — 13.4, ficha de `LearningPlan` ("target_level (ENUM
// A1-C2)"). Los 6 niveles del Marco Común Europeo de Referencia para las
// Lenguas, ya usados en todo el proyecto (p. ej. StudentProfile).
export const CefrLevel = {
  A1: "A1",
  A2: "A2",
  B1: "B1",
  B2: "B2",
  C1: "C1",
  C2: "C2",
} as const;

export type CefrLevel = (typeof CefrLevel)[keyof typeof CefrLevel];
