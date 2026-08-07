// Blueprint §8.1 — jerarquía centralizada de Query Keys. Invalidar siempre
// por el nodo más específico posible (Blueprint §16); nunca invalidar
// `academyKeys.all` completo salvo un evento verdaderamente global (cierre
// de sesión).
import type { TextType } from "../types/enums";

export const academyKeys = {
  all: ["academy"] as const,
  units: (textType?: TextType) => [...academyKeys.all, "units", { textType }] as const,
  unit: (unitId: string) => [...academyKeys.all, "unit", unitId] as const,
  unitAttempts: (unitId: string) => [...academyKeys.all, "unit", unitId, "attempts"] as const,
  continuation: () => [...academyKeys.all, "continuation"] as const,
  draft: (attemptId: string) => [...academyKeys.all, "attempt", attemptId, "draft"] as const,
  feedback: (attemptId: string, versionNumber: number) =>
    [...academyKeys.all, "attempt", attemptId, "feedback", versionNumber] as const,
  modelExamples: (textType?: TextType) => [...academyKeys.all, "model-examples", { textType }] as const,
  myProgress: () => [...academyKeys.all, "progress", "me"] as const,
  studentProgress: (studentId: string) => [...academyKeys.all, "progress", studentId] as const,
  studentUnitHistory: (studentId: string, unitId: string) =>
    [...academyKeys.all, "history", studentId, unitId] as const,
};
