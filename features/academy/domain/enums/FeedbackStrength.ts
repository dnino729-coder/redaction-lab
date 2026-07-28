// Enum de dominio — marca cada `FeedbackObservation` individual como
// fortaleza o debilidad (Domain Model v1.1, Sección 6, evidenciado por
// §8.6/§9.5). NO es una intensidad agregada del `Feedback` completo — eso
// no existe como concepto en el Domain Model Frozen.
export const FeedbackStrength = {
  STRENGTH: "STRENGTH",
  WEAKNESS: "WEAKNESS",
} as const;

export type FeedbackStrength = (typeof FeedbackStrength)[keyof typeof FeedbackStrength];
