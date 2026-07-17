// Repositorio: Evaluación del DELF (13.6), subconjunto para "nivel estimado
// de desempeño" (bloque 2). Envuelve database/queries con una interfaz
// orientada a entidad; no contiene reglas de negocio — ver ARCHITECTURE.md,
// sección 2.1.

import { queryLatestEvaluatedAttempt } from "@/database/queries/exam";
import type { StudentScopedClient } from "./withStudentContext";

export interface EstimatedPerformance {
  attemptId: string;
  finalScore: number;
  percentage: number;
  passed: boolean;
  evaluatedAt: Date;
}

export async function findEstimatedPerformance(
  tx: StudentScopedClient,
  studentId: string,
): Promise<EstimatedPerformance | null> {
  const attempt = await queryLatestEvaluatedAttempt(tx, studentId);
  if (!attempt?.evaluationResult) return null;

  return {
    attemptId: attempt.id,
    finalScore: Number(attempt.evaluationResult.finalScore),
    percentage: Number(attempt.evaluationResult.percentage),
    passed: attempt.evaluationResult.passed,
    evaluatedAt: attempt.evaluationResult.evaluatedAt,
  };
}
