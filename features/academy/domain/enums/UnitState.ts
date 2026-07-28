// Enum de dominio — máquina de estados oficial de AcademyUnit (Domain
// Model v1.1, Sección 6/9, A-07, exacta, sin modificación respecto a
// v1.0). `UnitState` es la ÚNICA fuente de verdad de progreso de la
// Unidad (invariante 6) — `Attempt.currentStep` es información de
// posición interna, nunca un segundo estado paralelo.
export const UnitState = {
  LOCKED: "LOCKED",
  UNLOCKED: "UNLOCKED",
  IN_PROGRESS: "IN_PROGRESS",
  AWAITING_FEEDBACK: "AWAITING_FEEDBACK",
  REVISION: "REVISION",
  REFLECTION: "REFLECTION",
  COMPLETED: "COMPLETED",
  MASTERED: "MASTERED",
} as const;

export type UnitState = (typeof UnitState)[keyof typeof UnitState];
