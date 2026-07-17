// Repositorio: Coach IA y Memoria (13.7), subconjunto para el bloque 5
// (Recomendación del Coach IA). Envuelve database/queries con una interfaz
// orientada a entidad; no contiene reglas de negocio ni genera
// recomendaciones — ver ARCHITECTURE.md, sección 2.1.

import { queryActiveRecommendation, queryCoachContext } from "@/database/queries/coach";
import type { StudentScopedClient } from "./withStudentContext";

export interface ActiveRecommendation {
  recommendationId: string;
  recommendation: string;
  priority: string;
  createdAt: Date;
}

export async function findActiveRecommendation(
  tx: StudentScopedClient,
  studentId: string,
): Promise<ActiveRecommendation | null> {
  const recommendation = await queryActiveRecommendation(tx, studentId);
  if (!recommendation) return null;

  return {
    recommendationId: recommendation.id,
    recommendation: recommendation.recommendation,
    priority: recommendation.priority,
    createdAt: recommendation.createdAt,
  };
}

export interface CoachContextSummary {
  currentLevel: string;
  targetLevel: string;
  updatedAt: Date;
}

export async function findCoachContext(
  tx: StudentScopedClient,
  studentId: string,
): Promise<CoachContextSummary | null> {
  const context = await queryCoachContext(tx, studentId);
  if (!context) return null;

  return {
    currentLevel: context.currentLevel,
    targetLevel: context.targetLevel,
    updatedAt: context.updatedAt,
  };
}
