// Enum de dominio — tipo de texto DELF B2 (Domain Model v1.1, Sección 6,
// heredado como vocabulario compartido de §13.5, no redefinido aquí).
export const TextType = {
  LETTER: "LETTER",
  ARTICLE: "ARTICLE",
  ESSAY: "ESSAY",
  EMAIL: "EMAIL",
  REPORT: "REPORT",
} as const;

export type TextType = (typeof TextType)[keyof typeof TextType];
